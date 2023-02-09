import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { Cards } from '../components/Shared';
import { LanguageContext } from '../LanguageContext';

export default function PaymentsScreen({ navigation }: any) {
	const { translation } = React.useContext(LanguageContext);

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.body}>
				<Cards
					navigation={navigation}
					horizontal={false}
					style={{ width: '100%', marginHorizontal: 0 }}
					translation={translation}
				/>
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
