import {
    Component,
    h,
    Prop,
    Event,
    EventEmitter,
    Watch,
    Element,
    State,
} from '@stencil/core';

import { Row } from '../kup-data-table/kup-data-table-declarations';
import { TooltipData, TooltipDetailData, TooltipAction } from './kup-tooltip-declarations';

@Component({
    tag: 'kup-tooltip',
    styleUrl: 'kup-tooltip.scss',
    shadow: true,
})
export class KupTooltip {
    /**
     * Layout used to display the items
     */
    @Prop()
    layout = '1';

    /**
     * Data for top section
     */
    @Prop()
    data: TooltipData;

    /**
     * Data for the detail
     */
    @Prop()
    detailData: TooltipDetailData;

    /**
     * Timeout for loadDetail
     */
    @Prop()
    detailDataTimeout: number = 800;
        
    @State()
    visible = false;

    @Element()
    tooltipEl: HTMLElement;

    @Event({
        eventName: 'kupTooltipLoadData',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupTooltipLoadData: EventEmitter;

    @Event({
        eventName: 'kupTooltipLoadDetail',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupTooltipLoadDetail: EventEmitter;

    @Event({
        eventName: 'kupActionCommandClicked',
        composed: true,
        cancelable: true,
        bubbles: true,
    })
    kupActionCommandClicked: EventEmitter<{
        actionCommand: TooltipAction;
    }>;    

    @Watch('data')
    onDataChanged() {
        if (this.visible) {
            this.positionRecalc();
            // loading detail
            this.loadDetailTimeout = setTimeout(() => this.loadDetail(), this.detailDataTimeout);
        }
    }

    // ---- Non reactive ----
    private tooltipPosition: {
        top?: string;
        bottom?: string;
        left?: string;
        right?: string;
    } = {};

    private tooltipTimeout: NodeJS.Timeout;
    private loadDetailTimeout: NodeJS.Timeout;
    private mouseLeaveTimeout: NodeJS.Timeout;

    private wrapperEl: HTMLSpanElement;

    // ---- Private methods ----
    private hasDetailData(): boolean {
        return !!this.detailData && !!this.detailData.rows;
    }
    

    private hasActionsData(): boolean {
        return this.hasDetailData() && !!this.detailData.actions && !!this.detailData.actions.command;        
    }

    private resetTimeouts() {
        if (this.tooltipTimeout) {
            clearTimeout(this.tooltipTimeout);
            this.tooltipTimeout = null;
        }

        if (this.loadDetailTimeout) {
            clearTimeout(this.loadDetailTimeout);
            this.loadDetailTimeout = null;
        }

        if (this.mouseLeaveTimeout) {
            clearTimeout(this.mouseLeaveTimeout);
            this.mouseLeaveTimeout = null;
        }
    }

    private loadDetail() {
        this.loadDetailTimeout = null;
        this.kupTooltipLoadDetail.emit();
    }

    get rows(): Row[] {
        return this.hasDetailData() ? this.detailData.rows : [];
    }

    private getImage(): string {
        if (this.data) {
            return this.data.image;
        }

        return '';
    }

    private getTitle(): string {
        if (this.data) {
            return this.data.title;
        }

        return '';
    }

    private getContent() {
        return this.data ? this.data.content : {};
    }

    // ---- Listeners ----
    private onMouseOver() {
        // Cancello il mouseLeaveTimeout così se l'utente
        // esce e rientra rimanendo nell'intervallo di 500ms 
        // il tip non si chiude
        if (this.mouseLeaveTimeout) {
            clearTimeout(this.mouseLeaveTimeout);
            this.mouseLeaveTimeout = null;
        }
        if (!this.tooltipTimeout) {
            this.tooltipTimeout = setTimeout(() => {
                this.tooltipTimeout = null;

                this.visible = true;

                this.kupTooltipLoadData.emit();
            }, 200);
        }
    }

    private onActionCommandClicked(event:Event, action:TooltipAction) {        
        //console.log("Emit kupActionCommandClicked: " + JSON.stringify(action));
        // Blocco la propagazione del onKupButtonClicked per evitare che lo stesso click
        // sia gestito da due handler differenti, creando problemi sulla navigazione
        event.stopPropagation();
        this.kupActionCommandClicked.emit({actionCommand: action})
    }


    private onMouseLeave() {
        // Se non sono presenti azioni si chiude immediatamente, altrimenti
        // lo chiudo dopo 500ms
        let timeout = this.hasActionsData()?500:0;
        this.mouseLeaveTimeout = setTimeout(() => {
            // reset data
            this.data = null;
            this.detailData = null;

            // reset visibility
            this.visible = false;

            // reset timeouts
            this.resetTimeouts();
        },timeout)
    }
    

    // ---- Render methods ----
    private getDefaultLayout() {
        return [
            <div class="left">
                <img src={this.getImage()} width="75" height="75" />
            </div>,
            <div class="right">
                <h3>{this.getTitle()}</h3>
                {this.getInfos()}
            </div>,
        ];
    }

    private getLayout2() {
        return (
            <div>
                <h3>{this.getTitle()}</h3>
            </div>
        );
    }

    private getLayout3() {
        return [
            <div>
                <h4>{this.getTitle()}</h4>
            </div>,
            this.getInfos(),
        ];
    }

    private getInfos() {
        let infos = null;

        const content = this.getContent();
        if (content) {
            infos = [];

            for (let i = 1; i <= 2; i++) {
                const info = content[`info${i}`];

                if (info && info.label && info.value) {
                    if (info.label != '' && info.value != '') {
                        infos.push(
                            <div>
                                <span class="label">{info.label}: </span>
                                {' ' + info.value}
                            </div>
                        );
                    }
                }
            }
        }

        return infos;
    }

    private positionRecalc() {
        // resetting position
        this.tooltipPosition = {};

        const rect = this.wrapperEl.getBoundingClientRect();
        let threshold = this.hasDetailData ? 300 : 150;

        // vertical position
        if (window.innerHeight - rect.bottom < threshold) {
            this.tooltipPosition.bottom = `${window.innerHeight -
                rect.top +
                3}px`;
        } else {
            this.tooltipPosition.top = `${rect.bottom + 3}px`;
        }

        // horizontal position
        if (window.innerWidth - rect.left < 350) {
            // 350 is the min-width of the tooltip
            this.tooltipPosition.right = `${window.innerWidth - rect.right}px`;
        } else {
            this.tooltipPosition.left = `${rect.left}px`;
        }
    }

    private createTooltip() {
        if (!this.data) {
            return null;
        }

        let mainContent = null;
        const mainContentClass = {};

        if (this.layout === '2') {
            mainContent = this.getLayout2();
            mainContentClass['layout2'] = true;
        } else if (this.layout === '3') {
            mainContent = this.getLayout3();
            mainContentClass['layout3'] = true;
        } else {
            mainContent = this.getDefaultLayout();
        }

        let detailContent = null;
        let detailActions = null;
        //console.log(this.detailData);
        if (this.hasDetailData()) {            
            detailContent = this.rows.map((row) =>
                row.cells['label'].value === '' ||
                row.cells['value'].value === '' ? (
                    <span></span>
                ) : (
                    <div class="detail-row">
                        <div class="detail-row__label">
                            {row.cells['label'].value}
                        </div>
                        <div class="detail-row__value">
                            {row.cells['value'].value}
                        </div>
                    </div>
                )
            );                      
            if (this.hasActionsData()) {                
                detailActions = this.detailData.actions.command.slice(0,5).map((action) =>
                    <div class="detail-actions__box">                           
                        <kup-button           
                            flat={true}
                            tooltip={action.text} 
                            iconClass={action.icon}
                            onKupButtonClicked={(event) => this.onActionCommandClicked(event, action)}                            
                        >
                        </kup-button>                                                                         
                    </div>                                                    
                );                  
            }                                                         
        }

        const detailClass = {
            visible: this.hasDetailData(),
        };

        const tooltipStyle = {
            ...this.tooltipPosition,
        };

        return (
            <div
                id="tooltip"
                hidden={!this.visible || !this.data}
                style={tooltipStyle}
            >
                <div id="main-content" class={mainContentClass}>
                    {mainContent}
                </div>
                <div id="detail" class={detailClass}>
                    {detailContent}
                </div>                                      
                <div 
                    /** 
                     * Stoppo la propagazione dell'onClick per evitare che arrivi al contenitore
                     * e che un singolo click venga gestito con due handler differenti
                     * creando potenziali problemi sulla navigazione.
                     * Esempio
                     * Se il tip è dentro una matrice il click darebbe luogo all'emissione 
                     * di due eventi kupActionCommandClicked e kupRowSelected, 
                     * il primo richiamerà ad esempio FUN1 e il secondo FUN2, ma se FUN1 
                     * viene aperta su una nuova finestra il risultato è che anche la finestra corrente
                     * che contiene il tip, verrebbe rimpiazzata dalla chiamatqa a FUN2
                     */
                    onClick={(e:MouseEvent) => e.stopPropagation()}
                    id="detail-actions"   
                    hidden={!this.hasActionsData()}
                >
                    {detailActions}
                </div>          
            </div>
        );
    }

    render() {
        return (
            <div
                id="wrapper"
                onMouseOver={this.onMouseOver.bind(this)}
                onMouseLeave={this.onMouseLeave.bind(this)}                
                ref={(el) => (this.wrapperEl = el)}
            >
                <slot />

                {this.createTooltip()}

                {/* <kup-portal
                    isVisible={this.visible}
                    nodes={this.createTooltip()}
                    portalParentRef={this.tooltipEl}
                    styleNode={this.tooltipEl.shadowRoot.querySelector('style')}
                    refOffset={this.tooltipPosition}
                /> */}
            </div>
        );
    }
}
