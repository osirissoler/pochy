import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import asyncStorage from '@react-native-async-storage/async-storage';
import { LanguageContext } from '../LanguageContext';
import { checkStorage, Loading } from '../components/Shared';

export default function SelectLanguageScreen({ navigation }: any) {
	const { translation, translate } = React.useContext(LanguageContext);
	const [buttonLocale, setButtonLocale]: any = useState('');
	const [showLoading, setShowLoading]: any = useState(false);

	useEffect(() => {
		checkStorage('USER_LOCALE', (response: any) => {
			changeDefaultLanguage(response);
		});
	}, []);

	const hideLoadingModal = (callback: Function) => {
		setTimeout(() => {
			setShowLoading(false);
			callback();
		}, 1500);
	};

	const changeDefaultLanguage = (locale: string) => {
		setShowLoading(true);
		asyncStorage.setItem('USER_LOCALE', locale).then(() => {
			hideLoadingModal(() => {
				setButtonLocale(locale);
				translate();
			});
		});
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
				<Text style={styles.buttonText}>{translation.t(text)}</Text>
			</TouchableOpacity>
		);
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.body}>
				<Loading showLoading={showLoading} translation={translation} />
				<View style={{ paddingVertical: 10, paddingHorizontal: 20, marginTop: 5 }}>
					<View style={{ justifyContent: 'center', alignItems: 'center' }}>
						<Button locale={'en'} text={'languageEnglish'} />
						<Button locale={'es'} text={'languageSpanish'} />
					</View>
				</View>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F7F7F7'
	},
	body: {
		marginHorizontal: 20,
		marginVertical: 30,
		padding: 20,
		backgroundColor: '#ffffff',
		height: 320,
		borderRadius: 20
	},
	button: {
		height: 80,
		justifyContent: 'center',
		alignItems: 'center',
		width: '90%',
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
	}
});
