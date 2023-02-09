import React, { useState, useEffect } from 'react';
import {
	SafeAreaView,
	View,
	FlatList,
	TextInput,
	Text,
	Image,
	StyleSheet,
	TouchableOpacity,
	Pressable
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { isObject } from 'formik';
import asyncStorage from '@react-native-async-storage/async-storage';
import { checkStorage, Loading } from '../components/Shared';
import { fetchData, sendData } from '../httpRequests';
import { LanguageContext } from '../LanguageContext';

export default function ListPharmaciesScreen({ navigation, route }: any) {
	const { translation } = React.useContext(LanguageContext);
	const [showLoading, setShowLoading]: any = useState(false);
	const [pharmacies, setPharmacies]: any = useState([]);
	const [pharmaciesData, setPharmaciesData]: any = useState([]);
	const [showList, setShowList]: any = useState(false);

	useEffect(() => {
		let unsuscribe = checkStorage('USER_PHARMACY', (response: any) => {
			if (!!response) {
				if (!!route.params) {
					if (route.params.from != 'home') {
						const pharmacy = JSON.parse(response);
						navigation.reset({
							index: 0,
							routes: [
								{ name: 'Root', params: { phId: 560, phName: pharmacy.name }, screen: 'Home' }
							]
						});
					} else {
						navigation.setOptions({
							headerBackVisible: true,
							gestureEnabled: true
						});
						fetchPharmacyData();
					}
				} else {
					const pharmacy = JSON.parse(response);
					navigation.reset({
						index: 0,
						routes: [{ name: 'Root', params: { phId: 560, phName: pharmacy.name }, screen: 'Home' }]
					});
				}
			} else {
				fetchPharmacyData();
			}
		});
		return unsuscribe;
	}, []);

	const setDefaultPharmacy = (pharmacy: any) => {
		checkStorage('USER_LOGGED', (id: string) => {
			const url = '/cart/getCart';
			const data = {
				user_id: id
			};
			sendData(url, data).then((response: any) => {
				if (Object.keys(response).length > 0) {
					const url = '/cart/clearCart';
					const data = {
						user_id: id
					};
					sendData(url, data);
				}
				asyncStorage.setItem('USER_PHARMACY', JSON.stringify(pharmacy));

				navigation.reset({
					index: 0,
					routes: [{ name: 'Root', params: { phId: 560, phName: pharmacy.name }, screen: 'Home' }]
				});
			})
		})
	};

	const setFavoritePharmacy = (pharmacy: any) => {
		setShowLoading(true);
		hideLoadingModal(() => {
			const currentPharmacy = pharmacies.find((item: any) => item.id == 560);
			if (isObject(currentPharmacy)) {
				asyncStorage.removeItem('USER_PHARMACY');
				setDefaultPharmacy(currentPharmacy);
			}
		});
	};

	const searchPharmacy = (text: string) => {
		const value = text.toLowerCase();
		setTimeout(() => {
			const filteredPharmacies = pharmaciesData.filter(
				(item: any) => item.name.toLowerCase().includes(value) || (item.city != null && item.city.toLowerCase().includes(value))
			);
			setPharmacies(filteredPharmacies);
		}, 1000);
	};

	const hideLoadingModal = (callback: Function) => {
		setTimeout(() => {
			setShowLoading(false);
			callback();
		}, 1500);
	};

	const fetchPharmacyData = () => {
		setShowLoading(true);
		const url = '/pharmacies/getPharmacies';
		fetchData(url)
			.then((responsePharmacies) => {
				hideLoadingModal(() => {
					if (Object.keys(responsePharmacies).length > 0) {
						checkStorage('USER_PHARMACY', (responsePharmacy: any) => {
							const pharmacyData = JSON.parse(responsePharmacy);
							const pharmacies = responsePharmacies['pharmacy'];
							if (pharmacyData) {
								const defaultPharmacy = pharmacies.find(
									(pharmacy: any) => 560 == pharmacyData.id
								);
								if (defaultPharmacy) {
									defaultPharmacy.favorite = true;
								}
							}
							setPharmacies(pharmacies);
							setPharmaciesData(pharmacies);
							setShowList(true);
						});
					} else {
						setPharmacies([]);
						setPharmaciesData([]);
					}
				});
			})
			.catch((error) => {
				console.log(error);
			});
	};

	return (
		<SafeAreaView style={styles.container}>
			<Loading showLoading={showLoading} translation={translation} />
			<View style={styles.body}>
				<View style={styles.formInputIcon}>
					<TextInput
						placeholder={translation.t(
							'listPharmaciesSearchPlaceholder'
						)} /* Search a name of a pharmacy or city */
						placeholderTextColor={'gray'}
						style={[styles.textInput, { zIndex: 1 }]}
						onChangeText={searchPharmacy}
					/>
					<FontAwesome style={styles.inputIcon} name='search' size={20} onPress={() => { }} />
				</View>
				{showList && (
					<FlatList
						data={pharmacies}
						renderItem={({ item }) => (
							<TouchableOpacity style={styles.itemCard} onPress={() => setFavoritePharmacy(item)}>
								<View style={{ flexDirection: 'row', justifyContent: 'flex-start', flex: 1 }}>
									<Image
										style={styles.itemImage}
										source={require('../assets/images/icon_coopharma.png')}
									/>
									<View>
										<Text style={styles.itemTitle}>{item.name}</Text>
										<Text style={styles.itemAddress}>{item.address}</Text>
									</View>
								</View>
								<Pressable onPress={() => setFavoritePharmacy(item)}>
									<FontAwesome
										name={item.favorite == true ? 'star' : 'star-o'}
										size={26}
										style={styles.itemFavorite}
									/>
								</Pressable>
							</TouchableOpacity>
						)}
					/>
				)}
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#ffffff'
	},
	body: {
		flex: 1,
		paddingTop: 10,
		paddingBottom: 20,
		paddingHorizontal: 20
	},
	formInputIcon: {
		position: 'relative',
		flexDirection: 'row'
	},
	textInput: {
		height: 50,
		width: '100%',
		backgroundColor: '#F7F7F7',
		paddingRight: 40,
		paddingLeft: 20,
		borderRadius: 5,
		marginVertical: 10
	},
	inputIcon: {
		position: 'absolute',
		right: 15,
		top: '35%',
		zIndex: 2
	},
	itemCard: {
		paddingVertical: 30,
		paddingHorizontal: 10,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(0, 0, 0, 0.1)'
	},
	itemImage: {
		width: 60,
		height: 60,
		marginRight: 10
	},
	itemTitle: {
		fontSize: 18,
		fontWeight: '500',
		paddingRight: 80
	},
	itemAddress: {
		maxWidth: 160,
		color: '#8B8B97',
		flexWrap: 'wrap'
	},
	itemFavorite: {
		color: 'orange'
	}
});
