const themeBackgrounds = {
	'light-primary': '#FFFFFF',
	'light-high-contrast': '#FEFEFE',
	'light-alt-1': '#FEFEFE',
	'light-alt-2': '#FCFCFC',
	'dark-primary': '#1B1B1B',
	'dark-high-contrast': '#191A1E',
	'dark-alt-1': '#16161C',
	'dark-alt-2': '#17191F',
};

function getTheme() {
	try {
		const settings = localStorage.getItem('settings');
		if (settings) {
			const parsed = JSON.parse(settings);
			return parsed.theme;
		}
	} catch (e) {}

	return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
		? 'dark-primary'
		: 'light-primary';
}

const theme = getTheme();
const backgroundColor = themeBackgrounds[theme] || themeBackgrounds['dark-primary'];
document.body.style.backgroundColor = backgroundColor;

const isDarkTheme = theme.startsWith('dark');
const iconColor = isDarkTheme ? '#EBEBEB' : '#444444';
const loaderIcon = document.querySelector('#app-loader svg');

if (loaderIcon) {
	loaderIcon.style.color = iconColor;
}

window.hideAppLoader = function () {
	const loader = document.getElementById('app-loader');
	if (loader) {
		loader.style.display = 'none';
	}
};
