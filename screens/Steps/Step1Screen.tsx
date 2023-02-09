import React, { useEffect, useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet, SafeAreaView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { checkStorage } from '../../components/Shared';
import { LanguageContext } from '../../LanguageContext';

export default function Step1Screen({ navigation }: any) {
	const { translation } = React.useContext(LanguageContext);
	const [showStep, setShowStep]: any = useState(false);

	useEffect(() => {
		checkStorage('USER_STEPS', (response: any) => {
			// console.log(response,"paso 1")
			if (!!response) navigation.reset({ index: 0, routes: [{ name: 'SignIn' }] });
			else setShowStep(true);
		});
	}, []);

	return (
		<SafeAreaView style={styles.container}>
			{showStep && (
				<>
					<View style={styles.imageParent}>
						<Image style={styles.image} source={require('../../assets/images/steps1-image.png')} />
					</View>
					<Text style={styles.title}>{translation.t('step1Title')}</Text>
					<View style={styles.buttonOutline}>
						<Pressable style={styles.button} onPress={() => navigation.navigate('Step2')}>
							<FontAwesome name='arrow-right' size={24} color='#ffffff' />
						</Pressable>
					</View>
				</>
			)}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#ffffff'
	},
	imageParent: {
		height: 330
	},
	image: {
		width: 300,
		height: 330
	},
	title: {
		color: '#000000',
		textAlign: 'center',
		paddingHorizontal: 15,
		marginVertical: 30,
		paddingTop: 20,
		fontSize: 23
	},
	buttonOutline: {
		borderRadius: 40,
		borderWidth: 6,
		borderLeftColor: '#F7F7F7',
		borderTopColor: '#40AA54',
		borderRightColor: '#40AA54',
		borderBottomColor: '#F7F7F7',
		height: 80,
		width: 80,
		justifyContent: 'center',
		alignItems: 'center'
	},
	button: {
		borderRadius: 100,
		backgroundColor: '#40AA54',
		height: 55,
		width: 55,
		justifyContent: 'center',
		alignItems: 'center'
	}
});
