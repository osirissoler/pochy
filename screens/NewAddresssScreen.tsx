import { Formik } from 'formik';
import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, Pressable, TextInput, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { BottomPopup } from '../components/BottomPopup';
import * as yup from 'yup';
import { checkStorage, Loading } from '../components/Shared';
import { sendData } from '../httpRequests';
import { LanguageContext } from '../LanguageContext';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
export default function NewAddressScreen({ route, navigation }: any) {
	console.log("paso 1")
	const [MarkerPosition, setMarkerPosition] = useState({
		 latitude:18.47 ,
		longitude:-69.95,
	});
	const { translation } = React.useContext(LanguageContext);
	const [address, setAddress]: any = useState({});
	const [isLoading, setIsLoading]: any = useState(true);
	const [showLoading, setShowLoading]: any = useState(false);

	const [errorMsg, setErrorMsg] = useState(null);
	const validationSchema = yup.object().shape({
		alias: yup.string().required(translation.t('addressAliasRequiredText')), // Alias is required
		phone: yup.string().required(translation.t('addressPhoneNumberRequiredText')), // Phone number is required
		address_1: yup.string().required(translation.t('addressAddressRequiredText')), // Address is required
		city: yup.string().required(translation.t('addressCityRequiredText')), // City is required
		state: yup.string().required(translation.t('addressStateRequiredText')), // State is required
		zip_Code: yup.string().required(translation.t('addressZIPRequiredText')) // ZIP Code is required
	});

	useEffect(() => {
		(async () => {
			let { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== 'granted') {
				setErrorMsg('Permission to access location was denied');
				return;
			}

			let location = await Location.getCurrentPositionAsync({});
			console.log("paso 2")
			const currentLocation ={ 
				
				latitude: location.coords.latitude, longitude: location.coords.longitude
			 }
			await setMarkerPosition(currentLocation);
			console.log(MarkerPosition)
		})();
	}, []);
	useEffect(() => {
		if (!!route.params) {
			setShowLoading(true);
			hideLoadingModal(() => {
				const address = route.params.address;
				if (address) setAddress(address);
				setIsLoading(false);
			});
		} else {
			setIsLoading(false);
		}
		return () => {
			setAddress({});
		};
	}, []);

	const hideLoadingModal = (callback: Function) => {
		setTimeout(() => {
			setShowLoading(false);
			callback();
		}, 1500);
	};

	const saveAddress = (values: any) => {
		setShowLoading(true);
		if (!!values.id) {
			const url = '/user/updateClientDirection';
			sendData(url, values).then((response: any) => {
				goBack();
			});
		} else {
			checkStorage('USER_LOGGED', (userId: any) => {
				values.user_id = userId;
				const url = '/user/createClientDirection';
				sendData(url, {...values,...MarkerPosition}).then((response: any) => {
					goBack();
				});
			});
		}
	};

	const goBack = () => {
		hideLoadingModal(() => navigation.goBack('Checkout', {...MarkerPosition }));
	};

	let popupRef: any = React.createRef();

	const onShowPopup = () => {
		popupRef.show();
	};

	const onClosePopup = () => {
		popupRef.close();
	};
	const onDragMarkerEnd = (e: any) => {
		console.log(e.nativeEvent.coordinate)
		setMarkerPosition(e.nativeEvent.coordinate)
	}
	const onRegionChange = (e: any) => {
		console.log(e)
	}
	useEffect(() => {
		(async () => {
			let { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== 'granted') {
				setErrorMsg('Permission to access location was denied');
				return;
			}

			let location = await Location.getCurrentPositionAsync({});
			console.log("paso 2")
			await setMarkerPosition({ latitude: location.coords.latitude, longitude: location.coords.longitude });
			console.log(MarkerPosition)
		})();
	}, []);
	return (
		<>
			<Loading showLoading={showLoading} translation={translation} />
			<View style={styles.containerMap}>
				<MapView
					style={styles.map}
					showsUserLocation={true}
					onRegionChange={onRegionChange}
					region={{
						latitude: MarkerPosition.latitude,
						longitude: MarkerPosition.longitude,
						latitudeDelta: 0.0922,
						longitudeDelta: 0.0421,
					}}

				>
					<Marker coordinate={MarkerPosition}
						pinColor="#12877f"
						draggable={true}
						onDragEnd={onDragMarkerEnd}
					>

					</Marker>
				</MapView>
			</View>
			<SafeAreaView style={styles.container}>
				<View>
					<Text>
						Longitud: {MarkerPosition.longitude}   Latitude: {MarkerPosition.latitude}
					</Text>
				</View>

				<View style={styles.body}>
					{!isLoading && (
						<Formik
							validationSchema={validationSchema}
							initialValues={
								Object.keys(address).length > 0
									? address
									: {
										alias: '',
										phone: '',
										address_1: '',
										address_2: '',
										notes: '',
										city: '',
										state: '',
										zip_Code: '',
										...MarkerPosition
									}
							}
							onSubmit={(values) => {
								saveAddress(values);
							}}
						>
							{({ handleChange, handleBlur, handleSubmit, values, errors }) => (
								<>
									<ScrollView style={{ flex: 1 }}>
										<Text style={styles.labelInput}>
											{translation.t('addressAliasLabel') /* Alias */}
										</Text>
										<TextInput
											style={styles.textInput}
											onChangeText={handleChange('alias')}
											onBlur={handleBlur('alias')}
											value={values.alias}
										/>
										<Text style={styles.labelInput}>
											{translation.t('addressPhoneNumberLabel') /* Phone Number */}
										</Text>
										<TextInput
											style={styles.textInput}
											onChangeText={handleChange('phone')}
											onBlur={handleBlur('phone')}
											value={values.phone}
										/>
										<Text style={styles.labelInput}>
											{translation.t('addressAddressLabel') /* Address */}
										</Text>
										<TextInput
											style={styles.textInput}
											onChangeText={handleChange('address_1')}
											onBlur={handleBlur('address_1')}
											value={values.address_1}
										/>
										<TextInput
											style={[styles.textInput, { marginTop: 0 }]}
											onChangeText={handleChange('address_2')}
											onBlur={handleBlur('address_2')}
											value={values.address_2}
										/>
										<Text style={styles.labelInput}>
											{translation.t('addressNotesLabel') /* Notes */}
										</Text>
										<TextInput
											style={styles.textInput}
											onChangeText={handleChange('notes')}
											onBlur={handleBlur('notes')}
											value={values.notes}
										/>
										<Text style={styles.labelInput}>
											{translation.t('addressCityLabel') /* City */}
										</Text>
										<TextInput
											style={styles.textInput}
											onChangeText={handleChange('city')}
											onBlur={handleBlur('city')}
											value={values.city}
										/>
										<View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
											<View style={{ width: '45%', marginRight: 10 }}>
												<Text style={styles.labelInput}>
													{translation.t('addressStateLabel') /* State */}
												</Text>
												<TextInput
													style={styles.textInput}
													onChangeText={handleChange('state')}
													onBlur={handleBlur('state')}
													value={values.state}
												/>
											</View>
											<View style={{ width: '45%' }}>
												<Text style={styles.labelInput}>
													{translation.t('addressZIPLabel') /* ZIP Code */}
												</Text>
												<TextInput
													style={styles.textInput}
													onChangeText={handleChange('zip_Code')}
													onBlur={handleBlur('zip_Code')}
													value={values.zip_Code}
												/>
											</View>
										</View>
									</ScrollView>
									<BottomPopup
										ref={(target) => (popupRef = target)}
										onTouchOutside={onClosePopup}
										title={'Alert'}
										errors={errors}
									/>
									<Pressable
										style={styles.registerButton}
										onPress={() =>
											Object.keys(errors).length > 0 ? onShowPopup() : handleSubmit()
										}
									>
										<Text style={styles.registerButtonText}>
											{translation.t('addressButtonSaveText') /* Save Address */}
										</Text>
									</Pressable>
								</>
							)}
						</Formik>
					)}
				</View>
			</SafeAreaView>
		</>
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
		height: 350,
		borderRadius: 20,
		flex: 1
	},
	labelInput: {
		fontSize: 14,
		color: '#8B8B97',
		fontWeight: '500',
		marginTop: 10
	},
	textInput: {
		marginTop: 5,
		height: 40,
		width: '100%',
		borderColor: 'rgba(0, 0, 0, 0.1)',
		borderWidth: 1,
		backgroundColor: '#FFFFFF',
		paddingRight: 35,
		paddingLeft: 20,
		borderRadius: 5
	},
	registerButton: {
		width: '100%',
		height: 50,
		backgroundColor: '#128780',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 10,
		marginTop: 20
	},
	registerButtonText: {
		color: '#ffffff',
		fontSize: 18
	},
	containerMap: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	},
	map: {
		width: Dimensions.get('window').width,
		height: Dimensions.get('window').height,
	},
});
