import React from 'react';
import { View, Text, Image, Pressable, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { LanguageContext } from '../../LanguageContext';

export default function Step2Screen({ navigation }: any) {
	const { translation } = React.useContext(LanguageContext);
	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.imageParent}>
				<Image style={styles.image} source={require('../../assets/images/steps2-image.png')} />
			</View>
			<Text style={styles.title}>{translation.t('step2Title')}</Text>
			<View style={styles.buttonOutline}>
				<Pressable style={styles.button} onPress={() => navigation.navigate('Step3')}>
					<FontAwesome name='arrow-right' size={24} color='#ffffff' />
				</Pressable>
			</View>
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
		borderBottomColor: '#40AA54',
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
