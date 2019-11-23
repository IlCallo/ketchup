import theme from './theme';
export function setTheme(data) {
    try {
        localStorage.setItem('theme', JSON.stringify(data));
        console.log('local storage set: ' + JSON.stringify(data));
    } catch (err) {
        console.log(err);
    }
}
export function getTheme(): Object {
    const themeData = localStorage.getItem('theme');
    console.log('local storage get: ' + JSON.stringify(themeData));
    if (themeData) {
        console.log('return not default theme');
        return JSON.parse(themeData);
    }
    // default theme
    console.log('return default theme');
    return theme;
}
