import React from 'react';
import * as Localization from 'expo-localization';
import i18n from 'i18n-js';
import en from './constants/languages/en.json';
import es from './constants/languages/es.json';
import { checkStorage } from './components/Shared';

const initialLanguageState = {
	translation: i18n
};

const setDefaultLanguage = (callback: any) => {
    checkStorage('USER_LOCALE', (locale: any) => {
        i18n.translations = {
            en: en,
            es: es
        };

        if (locale == null) {
            i18n.locale = Localization.locale;
        } else {
            i18n.locale = locale;
        }

        i18n.fallbacks = true;
        callback(i18n);
    });
}

const languageContextWrapper = (component?: React.Component) => ({
	...initialLanguageState,
	translate: () => {
        setDefaultLanguage((i18n: any) => {
            initialLanguageState.translation = i18n;
            component?.setState({ context: languageContextWrapper(component) }); 
        });
	}
});

type Context = ReturnType<typeof languageContextWrapper>;

export const LanguageContext = React.createContext<Context>(languageContextWrapper());

interface State {
	context: Context;
}

export class LanguageContextProvider extends React.Component {
	state: State = {
		context: languageContextWrapper(this)
	};

	render() {
		return <LanguageContext.Provider value={this.state.context}>{this.props.children}</LanguageContext.Provider>;
	}
}
