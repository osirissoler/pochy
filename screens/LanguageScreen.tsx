import React, { useState, useEffect } from 'react';
import { checkStorage, Container } from '../components/Shared';
import HeaderComponent from '../components/Header';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import asyncStorage from '@react-native-async-storage/async-storage';
import { LanguageContext } from '../LanguageContext';
import { FontAwesome } from '@expo/vector-icons';
import * as Localization from 'expo-localization';

export default function LanguageScreen({ navigation }: any) {
	const { translation, translate } = React.useContext(LanguageContext);
	const [buttonLocale, setButtonLocale]: any = useState('');
	const [showTranslation, setShowTranslation]: any = useState(false);

	useEffect(() => {
		translate();
		checkStorage('USER_LOCALE', (response: any) => {
			if (!!response) navigation.reset({ index: 0, routes: [{ name: 'Step1' }] });
			else {
				changeDefaultLanguage(Localization.locale);
				setShowTranslation(true);
			}
		});
	}, []);

	const changeDefaultLanguage = (locale: string) => {
		setButtonLocale(locale);
		asyncStorage.setItem('USER_LOCALE', locale).then(() => translate());
	};

	const Button = ({ locale, text }: any) => {
		return (
			<TouchableOpacity
				style={[styles.button, buttonLocale.includes(locale) && styles.buttonActive]}
				onPress={() => changeDefaultLanguage(locale)}
			>
				<View
					style={[
						{
							position: 'absolute',
							height: 15,
							width: 15,
							right: 8,
							top: 8,
							borderColor: 'rgba(0, 0, 0, 0.5)',
							borderWidth: 1,
							borderRadius: 10,
							justifyContent: 'center',
							alignItems: 'center'
						},
						buttonLocale.includes(locale) && { backgroundColor: '#128780', borderWidth: 0 }
					]}
				>
					{buttonLocale.includes(locale) && <FontAwesome name='check' size={10} color={'#fff'} />}
				</View>
				<Text style={[styles.buttonText, buttonLocale.includes(locale) && styles.buttonActiveText]}>
					{translation.t(text)}
				</Text>
			</TouchableOpacity>
		);
	};

	return (
		<Container>
			{showTranslation && buttonLocale && (
				<>
					<HeaderComponent />
					<View style={styles.body}>
						<View>
							<Text style={styles.title}>{translation.t('languageTitle')}</Text>
							<View style={{ marginTop: 30, justifyContent: 'center', alignItems: 'center' }}>
								<Button locale={'en'} text={'languageEnglish'} />
								<Button locale={'es'} text={'languageSpanish'} />
							</View>
						</View>
						<TouchableOpacity
							style={styles.loginButton}
							onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Step1' }] })}
						>
							<Text style={styles.loginButtonText}>{translation.t('languageNextButtonText')}</Text>
						</TouchableOpacity>
					</View>
				</>
			)}
		</Container>
	);
}

const styles = StyleSheet.create({
	body: {
		padding: 20,
		flex: 1,
		justifyContent: 'space-between'
	},
	title: {
		fontSize: 30,
		fontWeight: '300',
		marginVertical: 15,
		color: '#000',
		textAlign: 'center'
	},
	button: {
		height: 80,
		justifyContent: 'center',
		alignItems: 'center',
		width: 180,
		borderColor: '#000',
		borderWidth: 1,
		borderRadius: 15,
		marginVertical: 20
	},
	buttonText: {
		fontSize: 18,
		color: '#000'
	},
	buttonActive: {
		backgroundColor: '#12878020',
		borderColor: '#128780'
	},
	buttonActiveText: {},
	loginButton: {
		width: '100%',
		height: 50,
		backgroundColor: '#128780',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 10,
		marginVertical: 30
	},
	loginButtonText: {
		color: '#ffffff',
		fontSize: 18
	}
});
