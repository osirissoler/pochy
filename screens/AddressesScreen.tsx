import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { Addresses } from '../components/Shared';
import { LanguageContext } from '../LanguageContext';

export default function AddressesScreen({ navigation }: any) {
	const { translation } = React.useContext(LanguageContext);

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.body}>
				<Addresses navigation={navigation} translation={translation} />
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
		borderRadius: 20
	}
});
