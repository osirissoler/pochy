import React, { useState, useCallback } from 'react';
import { View, Linking, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, Pressable, Button } from 'react-native';
import Toast from 'react-native-root-toast';

import { Addresses, Cards, checkStorage, Loading } from '../components/Shared';
import { fetchData, sendData } from '../httpRequests';
import { LanguageContext } from '../LanguageContext';

import { Ionicons } from '@expo/vector-icons';
import WebView from 'react-native-webview';
import axios from 'axios';
import { formatter } from '../utils';
import { Feather } from '@expo/vector-icons';

export default function CheckoutScreen({ navigation, route }: any) {
	const { translation } = React.useContext(LanguageContext);
	const [address, setAddress]: any = useState('');
	const [card, setCard]: any = useState('');
	const [pickupStatus, setPickupStatus]: any = useState(false);
	const [showLoading, setShowLoading]: any = useState(false);
	const [placetoPayUrl, setplacetoPayUrl] = useState('')
	const [placeToPayOperationFineshed, setplaceToPayOperationFineshed] = useState(false)
	const [showPlaceToPayview, setshowPlaceToPayview] = useState(false);
	const [TOKEN, setTOKEN] = useState('')
	const [requestId, setrequestId] = useState('')
	const URLToRiderect = "https://coopharma-83beb.web.app/";
	const [isCreactedOrder, setisCreactedOrder] = useState(false)
	const [auxCont, setauxCont] = useState(0)
	//const [loading, setloading] = useState(false)
	
	const openPlaceToPayView = async () => {
		if ((address.id || pickupStatus) /*&& card*/) {
			console.log("adress", address)
			//console.log("evaluate condition")
			//setloading(true)
			await setShowLoading(true)
			let pharmacy_id;
			let userId;
			// checkStorage('USER_PHARMACY',(response: any) => {response? console.log("pid",JSON.parse(response).id):false; pharmacy_id = response.id});

			//esta misma linea aparece en 4 sitios mas en esta vista, crear una variable y volver reutilizable

			const TotalOrder = pickupStatus ? route.params.orderTotal - 6 - (6 * 0.115) : route.params.orderTotal;
			//console.log("pTp",route.params.products,route.params.products.map((x:any)=>x.Product_Name).join(', '))
			async function getIpClient() {
				try {
					const response = await axios.get('https://api.ipify.org?format=json');
					//console.log(response.data.ip)
					return response.data.ip
				} catch (error) {
					console.error(error);
				}
			}
			const url = '/placetopay/save/requestId';
			checkStorage('USER_PHARMACY', (response: any) => {
				checkStorage('USER_LOGGED', async (user: any) => {
					checkStorage('TOKEN', async (resp: any) => {
						setTOKEN(resp)
						//console.log(user); 
						userId = user
						let res = JSON.parse(response)
						//console.log(res.id)
						const data = {
							pharmacy_id: 560,
							user_id: userId,
							ipAdress: await getIpClient(),
							description: route.params.products.map((x: any, index: any) => x.Product_Name).join(', ').replace('"', ''),//address.notes,
							reference: Math.random().toString(36).substring(2),//route.params.products.map((x:any)=>x.Product_Name).join(', '),
							amount: TotalOrder,
							returnUrl: URLToRiderect,
							token_client: TOKEN,
							shopping: true

						}
						//	console.log("before load url", data, url)
						setShowLoading(true)
						await sendData(url, data).then((response) => {
							setplacetoPayUrl(response.data.processUrl);
							//console.log("url response", response);
							setrequestId(response.data.requestId)
							//hideLoadingModal( ()=>setshowPlaceToPayview(true));
							setshowPlaceToPayview(true)
							setShowLoading(false)
						}).catch((e) => { console.log("Razon del  fallo", e); setShowLoading(false) })
						//console.log("before load url,2", data, url)
						//setshowPlaceToPayview(true)
					})
				});
			});

			//console.log(route.params.products)
			//setloading(false)

			await setShowLoading(false)
		}
		else {
			//if (address.id ||pickupStatus) 
			showErrorToast(translation.t('NoAddressOrPickUpError'));
			//else if (!card) showErrorToast(translation.t('NoCardError'));
		}
	}
	const validateFields = () => {
		//console.log("dfdfgdfg")
		//if ((address || pickupStatus) && card) {
		setShowLoading(true);
		checkStorage('USER_PHARMACY', (response: any) => {

			const pharmacy = JSON.parse(response);
			checkStorage('USER_LOGGED', (userId: any) => {
				//console.log("test1", route.params.orderTotal)
				const url = '/orders/createOrder';

				const TotalOrder = pickupStatus ? route.params.orderTotal - 6 - (6 * 0.115) : route.params.orderTotal;
				const DeliveryFee = pickupStatus ? 0.00 : Number.parseFloat((Math.round(6).toFixed(2)));
				const TransactionFee = Number.parseFloat((Math.round(1).toFixed(2)));
				const order_total_without_tax = route.params.subTotal;
				const clientBankFee = route.params.bankFee;
				const order_total_tax = (route.params.subTotal) * 0.115;


				const data = {
					total_order: TotalOrder,// pickupStatus ? route.params.orderTotal - 6 : route.params.orderTotal,
					pharmacy_id: 560,
					user_id: userId,
					card_id: card,
					description_order: address.notes,
					pick_up_status: pickupStatus,
					alias: address.alias,
					address_1: address.address_1,
					address_2: address.address_2,
					phone: address.phone,
					client_state: address.state,
					city: address.city,
					zip_Code: address.zip_Code,
					latitude:address.latitude,
					longitude:address.longitude,
					totalDeliveryFee: DeliveryFee,
					delivery_fee_tax: Number.parseFloat((Math.round(DeliveryFee * 0.115).toFixed(2))),
					totalTransactioFee: TransactionFee,
					transaction_fee_tax: Number.parseFloat((Math.round(TransactionFee * 0.115).toFixed(2))),
					deposit_amount: TotalOrder - DeliveryFee - TransactionFee - order_total_tax - clientBankFee,
					order_total_without_tax,
					order_total_tax,
					clientBankFee,
					requestId: requestId,
					TOKEN: TOKEN
				};

				sendData(url, data)
					.then((response) => {
						//console.log("created order", response)
						hideLoadingModal(() => {
							const order = response['orderResults'];
							if (order) {
								setisCreactedOrder(true)
								Alert.alert(
									translation.t('alertInfoTitle'),
									(translation.locale.includes('en') && response.message) ||
									(translation.locale.includes('es') && response.mensaje),
									[
										{
											text: 'Ok',
										
										}
									]
								);
							} else {
								showErrorToast(translation.t('httpConnectionError'));
							}
						});
					})
					.catch((error) => {
						hideLoadingModal(() => {
							showErrorToast(translation.t('httpConnectionError'));
							console.log(error);
						});
					});
			});
		});
		// } else {
		// 	if (!address && !pickupStatus) showErrorToast(translation.t('NoAddressOrPickUpError'));
		// 	else if (!card) showErrorToast(translation.t('NoCardError'));
		// }
	};

	const payWithStripe = (order: any, pharmacy: any) => {
		//console.log("Klklklklkl")
		const url = '/stripe/pay';
		const data = {
			code: order.code
		};
		sendData(url, data);

		

		navigation.reset({
			index: 0,
			routes: [
				{
					name: 'Root',
					params: {
						phId: 560,
						phName: pharmacy.name
					},
					screen: 'Home'
				}
			]
		});
	};

	

	const showErrorToast = (message: string) => {
		Toast.show(message, {
			duration: Toast.durations.LONG,
			containerStyle: { backgroundColor: 'red', width: '80%' }
		});
	};

	const roundNumber = (number: number) => {
		return Number.parseFloat((Math.round(number * 100) / 100).toFixed(2));
	};

	const hideLoadingModal = (callback: Function) => {
		setShowLoading(true);
		setTimeout(() => {
			callback();
			setShowLoading(false);
		}, 1500);
	};
	const onNavigationStateChange = (state: any) => {
		console.log(state)
		setplaceToPayOperationFineshed(URLToRiderect == state.url)
		if (placetoPayUrl != state.url && !placeToPayOperationFineshed && state.navigationType == 'other' && !state.loading) {
			//	console.log("transaction has been completed", placetoPayUrl != state.url, !placeToPayOperationFineshed)

			const url = `/placeToPay/consultSession/${requestId}`

			fetchData(url).then((res) => {
				//console.log(res.respon.status.status)
				if (res.respon.status.status !== "REJECTED") {
					if (!isCreactedOrder) {
						validateFields();
					}
					else {
						checkStorage('USER_PHARMACY', (response: any) => {
							const pharmacy = JSON.parse(response);
							navigation.reset({
								index: 0,
								routes: [
									{
										name: 'Root',
										params: {
											phId: 560,
											phName: pharmacy.name
										},
										screen: 'Home'
									}
								]
							});
						})
					}
				} else {
					console.log("rejected")
					navigation.navigate('Root', { screen: 'ShoppingCart' })
				}

			}).catch((error) => console.log("error consult", error))


		}
		console.log(placeToPayOperationFineshed)
		if (placeToPayOperationFineshed) {
			//console.log("operation fineched")
			//console.log("Opera", placetoPayUrl, state.url)
			checkStorage('USER_PHARMACY', (response: any) => {
				const pharmacy = JSON.parse(response);
				navigation.reset({
					index: 0,
					routes: [
						{
							name: 'Root',
							params: {
								phId: 560,
								phName: pharmacy.name
							},
							screen: 'Home'
						}
					]
				});
			})
			//setauxCont(0)
			setshowPlaceToPayview(false)
		}
		//setauxCont(auxCont + 1)
		//console.log(placeToPayOperationFineshed)
	}
	const supportedURL = "https://coopharma-83beb.web.app/frequentquestions";

	const OpenURLButton = ({ url, children }) => {
		const handlePress = useCallback(async () => {
			// Checking if the link is supported for links with custom URL scheme.
			const supported = await Linking.canOpenURL(url);

			if (supported) {
				// Opening the link with some app, if the URL scheme is "http" the web link should be opened
				// by some browser in the mobile
				await Linking.openURL(url);
			} else {
				Alert.alert(`Don't know how to open this URL: ${url}`);
			}
		}, [url]);

		return <TouchableOpacity onPress={handlePress} style={{padding:10}}>
			<Text style={{
				width: '94%',
				alignSelf: 'flex-end',
				textAlign: 'right',
				padding: 5,
				fontSize: 16,
				paddingRight: 10,
				color:"#3366CC"
				
			}}>
				FAQ 
				<Feather name="help-circle"  size={24} color="#3366CC" />
			</Text>
		</TouchableOpacity>;
	};
	return (
		<SafeAreaView style={styles.container}>
			<Loading showLoading={showLoading} translation={translation} />
			{
				(!placeToPayOperationFineshed && showPlaceToPayview/*&&!showLoading*/) &&
				<View style={{ height: '100%' }}>
					<WebView
						source={{ uri: placetoPayUrl }}
						//originWhitelist={['*']}
						onNavigationStateChange={onNavigationStateChange}
					/>
				</View>
			}

			<View style={styles.body}>
				<View>
					<Addresses navigation={navigation} setAddress={setAddress} translation={translation} />
					<TouchableOpacity
						onPress={() => setPickupStatus(!pickupStatus)}
						style={{ flexDirection: 'row', alignItems: 'center' }}
					>
						<Text
							style={{
								width: '94%',
								alignSelf: 'flex-end',
								textAlign: 'right',
								padding: 5,
								fontSize: 16,
								paddingRight: 10
							}}
						>
							{translation.t('checkoutPickupText') /* Do you prefer picking up at the pharmacy? */}
						</Text>
						<View
							style={[
								{
									height: 17,
									width: 17,
									borderColor: 'rgba(0, 0, 0, 0.2)',
									borderWidth: 1,
									borderRadius: 4,
									justifyContent: 'center',
									alignItems: 'center',
									padding: 5
								},
								pickupStatus
									? { backgroundColor: '#128780', borderWidth: 0 }
									: { backgroundColor: '#fff' }
							]}
						>
							{pickupStatus == 1 && <Ionicons name='checkmark' size={12} color={'#fff'} />}
						</View>

					</TouchableOpacity>
					<OpenURLButton url={supportedURL}>
					</OpenURLButton>

					{/* <Cards navigation={navigation} setCard={setCard} translation={translation} /> */}
				</View>
				{(placeToPayOperationFineshed || !showPlaceToPayview) && <View style={{ position: 'relative', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
					<TouchableOpacity
						style={styles.buttonCheckout}
						onPress={() => {
							openPlaceToPayView()
							// const url='/placetopay/save/requestId';
							// checkStorage('USER_PHARMACY', (response: any) => {})
							// const data ={
							// 	pharmacyId:12,
							// 	ipAdress:'179.52.239.67',
							// 	reference:'test1',
							// 	amount:100,
							// 	returnUrl:"https://coopharma-83beb.web.app/",
							// 	shopping:true,
							// }
							// sendData(url, data).then((response)=>console.log(response))
							//validateFields();

						}}
					>
						<Text style={styles.buttonCheckoutText}>
							{translation.t('checkoutPayNowText') + '(' +
								formatter(roundNumber(pickupStatus ? route.params.orderTotal - 6 - (6 * 0.115) : route.params.orderTotal))}
							)
						</Text>
					</TouchableOpacity>

				</View>
				}
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
		padding: 20,
		flex: 1
	},
	productCard: {
		paddingVertical: 20,
		marginVertical: 8,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: 'rgba(0, 0, 0, 0.1)',
		flexDirection: 'row',
		justifyContent: 'space-around',
		position: 'relative'
	},
	productCardEdit: {
		color: '#128780',
		position: 'absolute',
		right: 3,
		top: 6,
		borderColor: '#128780',
		borderWidth: 1
	},
	buttonCheckout: {
		position: 'absolute',
		bottom: 0,
		width: '100%',
		height: 50,
		backgroundColor: '#128780',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 10,
		marginTop: 50,
		marginBottom: 5
	},
	buttonCheckoutText: {
		color: '#ffffff',
		fontSize: 18
	}
});
