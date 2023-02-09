import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Image, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { sendData } from '../httpRequests';
import { checkLoggedUser, checkStorage, Loading } from '../components/Shared';
import Toast from 'react-native-root-toast';
import { LanguageContext } from '../LanguageContext';
import { formatter } from '../utils';


export default function ProductDetailsScreen({ navigation, route }: any) {
	const { translation } = React.useContext(LanguageContext);
	const [product, setProduct]: any = useState({});
	const [productPrice, setProductPrice]: any = useState(0.0);
	const [productQuantity, setProductQuantity]: any = useState(1);
	const [showLoading, setShowLoading]: any = useState(false);

	useEffect(() => fetchProduct(), []);

	const fetchProduct = () => {
		setShowLoading(true);
		checkStorage('USER_PHARMACY', (response: any) => {
			const pharmacy = JSON.parse(response);
			const url = '/products/getPharmaciesProductByid';
			const params = route.params;
			const data = {
				id: params.productId,
				pharmacy_id: 560
			};
			//console.log(data,params,"detail")
			sendData(url, data).then((response: any) => {
				hideLoadingModal(() => {
					if (Object.keys(response).length > 0) {
						const product = response['pharmacyProduct'];
						setProduct(product);
						setProductPrice(product.price);
					} else {
						setProduct({});
						setProduct(0);
					}
				});
			});
		});
	};

	const modifyPrice = (type: number) => {
		let price: number = productPrice;
		let quantity: number = productQuantity;
		if (type == 1) {
			price = +price + +product.price;
			quantity += 1;
		} else {
			price = price - product.price;
			quantity -= 1;
		}

		if (quantity <= product.stock) {
			if (price >= product.price) {
				setProductPrice(roundNumber(price));
				setProductQuantity(quantity);
			}
		} else {
			showErrorToast(translation.t('productDetailsMaxQuantityError')); // The quantity is greater than the stock, please choose a lesser one.
		}
	};

	const roundNumber = (number: number) => {
		return Number.parseFloat((Math.round(number * 100) / 100).toFixed(2));
	};

	const addProductToShoppingCart = (id: string) => {
		const shoppingProduct = {
			user_id: id,
			pharmacy_product_id: product.product_pharmacy_id,
			ammount: productQuantity,
			price: productPrice
		};
        console.log('shopping cart')
		const url = '/cart/addToCart';
		sendData(url, shoppingProduct).then((response) => {
			if (Object.keys(response).length > 0) {
				Alert.alert(
					translation.t('alertInfoTitle'), // Information
					translation.t('productDetailsAddedProductText'), // Product added to shopping cart
					[
						{
							text: translation.t('productDetailsKeepBuyingText'), // Keep Buying
							onPress: () => {
								navigation.navigate('Root', { screen: 'home' });
							}
						},
						{
							text: translation.t('productDetailsGoCartText'), // Go to Cart
							onPress: () => {
								navigation.navigate('Root', { screen: 'ShoppingCart' });
							}
						}
					]
				);
			} else {
				showErrorToast(translation.t('httpConnectionError'));
			}
		});
	}

	const addToCart = () => {
		setShowLoading(true);
		checkLoggedUser(
			(id: string) => {
				const url = '/cart/getCartById';
				const data = {
					user_id: id,
					product_id: product.product_pharmacy_id
				};
				console.log('add to cart',data,)
				console.log(data)
				sendData(url, data)
					.then((response: any) => {
						hideLoadingModal(() => {
							if (Object.keys(response).length > 0) {
								const cartDetail = response['cartdetail'];
								if (productQuantity + cartDetail.ammount <= product.stock) {
									addProductToShoppingCart(id);
								} else showErrorToast(translation.t('productDetailsMaxStockError')); // The quantity of this product whithin the shopping cart has reached the maximum available, either choose a lesser quantity to add or remove it.
							} else {
								addProductToShoppingCart(id);
							}
						});
					})
					.catch((error) => {
						hideLoadingModal(() => {
							showErrorToast(translation.t('httpConnectionError'));
							console.log(error);
						});
					});
			},
			navigation,
			translation
		);
	};

	const showErrorToast = (message: string) => {
		Toast.show(message, {
			duration: Toast.durations.LONG,
			containerStyle: { backgroundColor: 'red', width: '80%' }
		});
	};

	const hideLoadingModal = (callback: Function) => {
		setTimeout(() => {
			setShowLoading(false);
			callback();
		}, 1500);
	};

	return (
		<SafeAreaView style={styles.container}>
			<Loading showLoading={showLoading} translation={translation} />
			<View style={styles.body}>
				<View style={styles.productImage}>
					<View style={{ height: 130, width: '100%' }}>
						<Image source={{ uri: product.product_img }} style={{ flex: 1, resizeMode: 'contain' }} />
					</View>
				</View>
				<Text style={styles.productName}>{product.product_name}</Text>
				<View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
					<Text style={styles.productPrice}>{formatter( productPrice)}</Text>
					{product.stock > 0 && (
						<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
							<AntDesign name='minus' size={24} style={styles.priceIcon} onPress={() => modifyPrice(2)} />
							<Text style={{ fontSize: 20, alignSelf: 'center' }}>{productQuantity}</Text>
							<AntDesign name='plus' size={24} style={styles.priceIcon} onPress={() => modifyPrice(1)} />
						</View>
					)}
				</View>
				<Text style={{ fontSize: 16 }}>{translation.t('headerTitleProductDetails') /* Product Details */}</Text>
				<Text style={styles.productDescription}>{product.product_description}</Text>
				{(product.stock > 0 && (
					<TouchableOpacity style={styles.productAdd} onPress={addToCart}>
						<Text style={styles.productAddText}>
							{translation.t('productDetailsAddCartText') /* Add to Cart */}
						</Text>
					</TouchableOpacity>
				)) ||
					(product.stock == 0 && (
						<Text style={{ textAlign: 'center', fontSize: 16, fontWeight: 'bold', color: 'red' }}>
							{translation.t('productDetailsStockError') /* Product out of stock */}
						</Text>
					))}
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
		paddingVertical: 20,
		paddingHorizontal: 15
	},
	productImage: {
		justifyContent: 'center',
		alignItems: 'center',
		padding: 40,
		// backgroundColor: 'rgba(213, 240, 219, 0.5)',
		borderRadius: 20
	},
	productName: {
		marginTop: 30,
		marginBottom: 20,
		fontSize: 22,
		fontWeight: '600'
	},
	productPrice: {
		fontSize: 20,
		fontWeight: '600',
		color: '#40AA54'
	},
	priceIcon: {
		marginHorizontal: 15,
		borderWidth: 1,
		borderColor: 'rgba(0, 0, 0, 0.1)',
		borderRadius: 10,
		padding: 3,
		color: '#40AA54'
	},
	productDescription: {
		marginVertical: 15,
		color: '#8B8B97'
	},
	productAdd: {
		marginTop: 20,
		alignSelf: 'center',
		backgroundColor: '#128780',
		height: 60,
		width: '75%',
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 15
	},
	productAddText: {
		color: '#ffffff',
		fontSize: 16,
		fontWeight: '500'
	}
});
