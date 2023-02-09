import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	Pressable,
	StyleSheet,
	FlatList,
	Image,
	Alert,
	TouchableOpacity,
	Modal,
	TextInput
} from 'react-native';
import { checkLoggedUser, Container } from '../components/Shared';
import HeaderComponent from '../components/Header';
import { sendData, sendDataPut } from '../httpRequests';
import { checkStorage } from '../components/Shared';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-root-toast';
import { LanguageContext } from '../LanguageContext';
import { formatter } from '../utils';


export default function ShoppingCartScreen({ navigation }: any) {
	const { translation } = React.useContext(LanguageContext);
	const [products, setProducts]: any = useState([]);
	const [cartPrices, setCartPrices]: any = useState({});
	const [pharmacy, setPharmacy]: any = useState({});
	const [isFetching, setIsFetching]: any = useState(false);
	const MunicipalTax =0.01, StateTax =0.105;

	useEffect(() => {
		const unsuscribe = navigation.addListener('focus', () => {
			checkLoggedUser(() => fetchProducts(), navigation, translation);
		});
		return unsuscribe;
	}, []);

	const fetchProducts = () => {
		checkStorage('USER_PHARMACY', (response: any) => {
			const data = JSON.parse(response);
			setPharmacy(data);
		});

		checkStorage('USER_LOGGED', (id: any) => {
			const url = '/cart/getCart';
			const data = { user_id: id };
			sendData(url, data).then((response: any) => {
				console.log(response)
				if (Object.keys(response).length > 0) {
					const products = response['cartdetail'];
					setProducts(products);
					calculatePrices(products);
				} else {
					setProducts([]);
					calculatePrices([]);
				}
				setIsFetching(false);
			});
		});
	};

	const deleteProduct = (product: any) => {
		Alert.alert(
			translation.t('alertWarningTitle'),
			translation.t('shoppingCartRemoveItemText'), // Do you want to remove this item?
			[
				{
					text: translation.t('alertButtonYesText'), // Yes
					onPress: () => {
						const url = '/cart/removeFromCart';
						const data = { id: product.id };
						sendData(url, data).then(() => onRefresh());
					}
				},
				{
					text: translation.t('alertButtonNoText') // No
				}
			]
		);
	};

	const modifyPrice = (type: number, product: any) => {
		const url = '/products/getPharmaciesProductByid';
		const data = { pharmacy_id: 560, id: product.pharmacy_product_id };
		sendData(url, data).then((response) => {
			console.log(response)
			let ammount = product.ammount;
			if (type == 1) ammount += 1;
			else ammount -= 1;

			const originalProduct = response['pharmacyProduct'];
			const originalPrice = Number.parseFloat(originalProduct.price);

			let price = originalPrice * ammount;
			if (product.gift_status_id == 1) price = (originalPrice + originalProduct.gift_price) * ammount;

			if (ammount <= originalProduct.stock) {
				if (price >= Number.parseFloat(originalProduct?.price)) {
					product.price = roundNumber(price);
					product.ammount = ammount;
					const url = '/cart/updateAmmountToCart';
					const data = { id: product.id, ammount: product.ammount, price: product.price };
					sendDataPut(url, data).then(() => onRefresh());
				}
			} else {
				showErrorToast(translation.t('productDetailsMaxQuantityError'));
			}
		});
	};

	const showErrorToast = (message: string) => {
		Toast.show(message, {
			duration: Toast.durations.LONG,
			containerStyle: { backgroundColor: 'red', width: '80%' }
		});
	};

	const calculatePrices = (products: any) => {
		let prices = {
			subTotal: 0.0,
			ivu_est: 0.0,
			ivu_mun: 0.0,
			fee: 1.0,
			deliveryFee: 6.0,
			total: 0.0,
			bankFee:0.0
		};

		products.map((product: any) => {
			let price = product.price;
			const subTotal = prices.subTotal + price;
			prices.subTotal = roundNumber(subTotal);
			//Los impuestos deben de aplicar para el total del valor de la orden ((subtotal+ transation fee+ delivery fee)*0.115)
			// if (product.ivu_statal) {
			// 	prices.ivu_est += product.price * 0.105;
			// }
			// if (product.ivu_municipal) {
			// 	prices.ivu_mun += product.price * 0.01;
			// }
		});
		
		prices.total = roundNumber(prices.subTotal + /*prices.ivu_est + prices.ivu_mun +*/ prices.fee + prices.deliveryFee);
		prices.ivu_est = roundNumber(prices.total*StateTax);
		prices.ivu_mun = roundNumber(prices.total*MunicipalTax);
		prices.total = roundNumber(prices.subTotal + prices.ivu_est + prices.ivu_mun + prices.fee + prices.deliveryFee)
		prices.bankFee=(prices.total*0.0175)+0.18
		prices.total = roundNumber(prices.subTotal + prices.ivu_est + prices.ivu_mun + prices.fee + prices.deliveryFee+prices.bankFee);

		console.log("prices",prices)
		setCartPrices(prices);
	};

	const onRefresh = () => {
		setIsFetching(true);
		fetchProducts();
	};

	const roundNumber = (number: number) => {
		//por que lo multiplicas y lo divides? parace inecesario. Nota: revisar esta funcion
		return Number.parseFloat((Math.round(number * 100) / 100).toFixed(2));
	};

	return (
		<Container>
			<HeaderComponent />
			<View style={styles.body}>
				{  (products.length == 0) ? <View style={{
					justifyContent: 'center',
					// flex: 1, 
					alignItems: 'center',
					// backgroundColor: '#128780',
					borderRadius: 5,
					height: '100%',

				}}>
					<View style={styles.imageParent}>
						<Image style={styles.image} source={require('../assets/images/steps3-image.png')} />
					</View>
					<Text style={styles.productCount} >
						{translation.t('shoppingCartItemsCountText')}
						{/* {Object.keys(products).length + translation.t('shoppingCartItemsCountText') } */}
					</Text>

				</View>
				:<FlatList
					extraData={products}
					style={{ height: '50%' }}
					refreshing={isFetching}
					onRefresh={onRefresh}
					data={products}
					renderItem={({ item }) => (
						<ProductCard
							item={item}
							pharmacy={pharmacy}
							deleteProduct={deleteProduct}
							modifyPrice={modifyPrice}
							fetchProducts={fetchProducts}
						/>
					)}
				/>}
				
				{ (products.length != 0) ? <View style={{ marginTop: 10 }}>
					<View style={styles.cartPrices}>
						<Text>Sub Total</Text>
						<Text style={styles.cartPrice}>{formatter( cartPrices.subTotal)}</Text>
					</View>
					<View style={styles.cartPrices}>
						<View>
							<Text>{translation.t('orderStateSUTText') /* State SUT */}</Text>
						</View>
						<View>
							<Text style={styles.cartPrice}>{formatter(cartPrices.ivu_est)}</Text>
						</View>
					</View>
					<View style={styles.cartPrices}>
						<View>
							<Text>{translation.t('orderMunicipalSUTText') /* Municipal SUT */}</Text>
						</View>
						<View>
							<Text style={styles.cartPrice}>{formatter(cartPrices.ivu_mun)}</Text>
						</View>
					</View>
					<View style={styles.cartPrices}>
						<Text>{translation.t('orderTransactionFeeText') /* Transaction Fee */}</Text>
						<Text style={styles.cartPrice}>{formatter(cartPrices.fee)}</Text>
					</View>
					<View style={styles.cartPrices}>
						<Text>{translation.t('orderDeliveryFeeText') /* Delivery Fee */}</Text>
						<Text style={styles.cartPrice}>{formatter(cartPrices.deliveryFee)}</Text>
					</View>
					<View style={styles.cartPrices}>
						<Text>{translation.t('bankFee') /* Delivery Fee */}</Text>
						<Text style={styles.cartPrice}>{formatter(cartPrices.bankFee)}</Text>
					</View>
					<View style={styles.cartPrices}>
						<Text style={{ fontWeight: '700', fontSize: 16 }}>Total</Text>
						<Text style={[styles.cartPrice, { fontWeight: '700', fontSize: 16 }]}>{formatter(cartPrices.total)}</Text>
					</View>
				</View>:<View></View>}
				{(products.length != 0) ? <Pressable
					style={[
						styles.buttonCheckout,
						Object.keys(products).length == 0 ? { backgroundColor: '#12878050' } : null
					]}
					disabled={Object.keys(products).length == 0}
					onPress={() => navigation.navigate('Checkout', { orderTotal: cartPrices.total, subTotal:cartPrices.subTotal,bankFee:cartPrices.bankFee ,products:products})}
				>
					<Text style={styles.buttonCheckoutText}>
						{translation.t('shoppingCartFinalizeText') /* Finalize Purchase */}
					</Text>
				</Pressable>:<Pressable></Pressable>}
			</View>
		</Container>
	);
}

function ProductCard({ item, pharmacy, deleteProduct, modifyPrice, fetchProducts }: any) {
	const { translation } = React.useContext(LanguageContext);
	const [product, setProduct]: any = useState({});
	const [giftMessage, setGiftMessage]: any = useState(item.message || '');
	const [giftFrom, setGiftFrom]: any = useState(item.from || '');
	const [giftStatus, setGiftStatus]: any = useState(item.gift_status_id);
	const [showModal, setShowModal]: any = useState(false);

	useEffect(() => {
		fetchProductData();
		return () => {
			setProduct({});
		};
	}, []);

	const fetchProductData = () => {
		const url = '/products/getPharmaciesProductByid';
		const data = { pharmacy_id: 560, id: item.pharmacy_product_id };
		sendData(url, data).then((response) => {
			//console.log(response,'soping cart')
			if (Object.keys(response).length > 0) {
				const data = response['pharmacyProduct'];
				setProduct(data);
			}
		});
	};

	const closeModal = () => {
		setShowModal(false);
	};

	const openModal = () => {
		setShowModal(true);
		setGiftStatus(1);
	};

	const changeGiftStatus = () => {
		let price = item.ammount * product.price;
		const giftPrice = item.ammount * product.gift_price;

		if (giftStatus == 1) price += giftPrice;
		else {
			price = product.price * item.ammount;
			setGiftFrom('');
			setGiftMessage('');
		}

		const url = '/cart/updateAmmountToCart';
		const data = {
			id: item.id,
			ammount: item.ammount,
			price: price,
			from: giftFrom,
			message: giftMessage,
			gift_status_id: giftStatus
		};
		sendDataPut(url, data).then((response) => {
			fetchProducts();
			closeModal();
		});
	};

	return (
		<View style={styles.productCard}>
			<Ionicons
				name='close-circle'
				size={22}
				style={styles.productCardDelete}
				onPress={() => deleteProduct(item)}
			/>
			<View style={{ flexDirection: 'row', justifyContent: 'space-around', position: 'relative' }}>
				<View style={styles.productImage}>
					<Image source={{ uri: product.product_img }} style={{ flex: 1, resizeMode: 'contain' }} />
				</View>
				<View style={{ justifyContent: 'space-between', width: 160 }}>
					<Text style={styles.productTitle}>{product.product_name}</Text>
					<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
						<Text style={styles.productPrice}>{item.price}</Text>
						<View style={styles.productAdd}>
							<AntDesign
								name='minus'
								size={24}
								style={styles.productAddIcon}
								onPress={() => modifyPrice(2, item)}
							/>
							<Text style={{ fontSize: 20, alignSelf: 'center' }}>{item.ammount}</Text>
							<AntDesign
								name='plus'
								size={24}
								style={styles.productAddIcon}
								onPress={() => modifyPrice(1, item)}
							/>
						</View>
					</View>
				</View>
			</View>
			<View style={{ marginTop: 20 }}>
				{giftStatus == 1 && (
					<>
						<View style={{ marginLeft: 10 }}>
							<Text style={{ fontStyle: 'italic' }}>"{giftMessage}"</Text>
							<Text style={{ fontStyle: 'italic' }}>
								{translation.t('giftFromText') /* From: */ + giftFrom}
							</Text>
						</View>
					</>
				)}
				{product.gift_status && (
					<TouchableOpacity style={styles.buttonGift} onPress={() => openModal()}>
						<Ionicons name='gift' size={20} style={{ marginRight: 5 }} />
						<Text style={{ fontSize: 16 }}>{translation.t('giftButtonSendGiftText') /* Send as a gift */}</Text>
					</TouchableOpacity>
				)}
			</View>
			<Modal transparent visible={showModal}>
				<View
					style={{
						justifyContent: 'center',
						alignItems: 'center',
						flex: 1,
						backgroundColor: 'rgba(0, 0, 0, 0.2)'
					}}
				>
					<View
						style={{
							height: 280,
							width: '80%',
							backgroundColor: '#fff',
							borderColor: 'rgba(0, 0, 0, 0.4)',
							borderWidth: 1,
							borderRadius: 30
						}}
					>
						<View
							style={{
								height: 40,
								backgroundColor: 'rgba(0, 0, 0, 0.1)',
								borderTopLeftRadius: 30,
								borderTopRightRadius: 30,
								flexDirection: 'row',
								justifyContent: 'space-between',
								alignItems: 'center',
								paddingHorizontal: 15
							}}
						>
							<Text style={{ fontSize: 16, fontWeight: '500' }}>
								{translation.t('giftOptionsTitle') /* Gift options */}
							</Text>
						</View>
						<View style={{ paddingVertical: 10, paddingHorizontal: 20, marginTop: 5 }}>
							<View style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
								<Text>{translation.t('giftMessageText') /* Message */}</Text>
								<View style={{ flexDirection: 'row', alignItems: 'center' }}>
									<TouchableOpacity
										onPress={() => {
											giftStatus == 1 ? setGiftStatus(2) : setGiftStatus(1);
										}}
										style={[
											giftStatus == 1
												? { backgroundColor: '#128780' }
												: { backgroundColor: '#fff' },
											{
												borderRadius: 5,
												borderColor: 'rgba(0, 0, 0, 0.2)',
												borderWidth: 1,
												height: 15,
												width: 15,
												justifyContent: 'center',
												alignItems: 'center',
												marginRight: 5
											}
										]}
									>
										{giftStatus == 1 && <Ionicons name='checkmark' size={12} color={'#fff'} />}
									</TouchableOpacity>
									<Text>{translation.t('giftButtonSendGiftText') /* Send as a gift */}</Text>
								</View>
							</View>
							<TextInput
								value={giftMessage}
								onChangeText={(text) => setGiftMessage(text)}
								multiline={true}
								style={{
									borderWidth: 1,
									borderColor: 'rgba(0, 0, 0, 0.2)',
									height: 80,
									marginTop: 10,
									borderRadius: 10,
									padding: 10
								}}
							/>
							<View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
								<Text>{translation.t('giftFromText') /* From: */}</Text>
								<TextInput
									value={giftFrom}
									onChangeText={(text) => setGiftFrom(text)}
									style={{
										borderBottomWidth: 1,
										borderBottomColor: 'rgba(0, 0, 0, 0.2)',
										width: '80%',
										paddingHorizontal: 10,
										paddingBottom: 5
									}}
								/>
							</View>
						</View>
						<View style={{ justifyContent: 'center', flex: 1, alignItems: 'center' }}>
							<TouchableOpacity
								onPress={() => changeGiftStatus()}
								style={{
									backgroundColor: '#128780',
									height: 35,
									width: 150,
									borderRadius: 5,
									justifyContent: 'center',
									alignItems: 'center'
								}}
							>
								<Text style={{ fontSize: 16, color: '#fff', fontWeight: '500' }}>
									{translation.t('giftSaveButtonText') /* Save Options */}
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	body: {
		paddingVertical: 20,
		paddingHorizontal: 15,
		flex: 1
	},
	productCount: {
		fontSize: 20,
		marginBottom: 10,
		marginVertical:20,
		color:"red"
		
	},
	imageParent: {
		height: 330
	},
	image: {
		width: 300,
		height: 330
	},
	productCard: {
		padding: 20,
		marginVertical: 8,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: 'rgba(0, 0, 0, 0.1)',
		flexDirection: 'column',
		justifyContent: 'space-around',
		position: 'relative'
	},
	productCardDelete: {
		color: 'red',
		position: 'absolute',
		right: 0,
		top: -10
	},
	productImage: {
		height: 100,
		width: 100
	},
	productTitle: {
		fontSize: 16,
		fontWeight: '500'
	},
	productPrice: {
		fontSize: 16,
		fontWeight: '500',
		alignSelf: 'center'
	},
	productAdd: {
		borderRadius: 100,
		flexDirection: 'row'
	},
	productAddIcon: {
		color: '#128780',
		marginHorizontal: 15,
		borderWidth: 1,
		borderColor: 'rgba(0, 0, 0, 0.1)',
		borderRadius: 10,
		padding: 2
	},
	cartPrices: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingVertical: 2
	},
	cartPrice: {
		textAlign: 'right'
	},
	buttonCheckout: {
		width: '100%',
		height: 50,
		backgroundColor: '#128780',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 10,
		marginTop: 10,
		marginBottom: 5
	},
	buttonCheckoutText: {
		color: '#ffffff',
		fontSize: 18
	},
	buttonGift: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		marginTop: 10,
		marginLeft: 10,
		borderWidth: 1,
		borderColor: 'rgba(0, 0, 0 , 0.3)',
		width: 190,
		justifyContent: 'center',
		padding: 5,
		borderRadius: 12
	}
});
