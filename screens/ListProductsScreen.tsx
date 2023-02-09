import { FontAwesome } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Pressable, SafeAreaView, Image } from 'react-native';
import { checkStorage, Loading } from '../components/Shared';
import { fetchData, sendData } from '../httpRequests';
import { LanguageContext } from '../LanguageContext';

export default function ListProductsScreen({ navigation }: any) {
	const { translation } = React.useContext(LanguageContext);
	const [products, setProducts]: any = useState([]);
	const [productsSearch, setProductsSearch]: any = useState([]);
	const [showLoading, setShowLoading]: any = useState(false);

	useEffect(() => {
		fetchProduct();
	}, []);

	const fetchProduct = () => {
		setShowLoading(true);
		checkStorage('USER_PHARMACY', (response: any) => {
			const pharmacy = JSON.parse(response);
			const url = '/products/getProductsByPharmacy';
			const data = { pharmacy_id: 560 };
			sendData(url, data)
				.then((response) => {
					setShowLoading(true);
					hideLoadingModal(() => {
						if (Object.keys(response).length > 0) {
							const products = response['pharmacyproduct'];
							setProducts(products);
							setProductsSearch(products);
						}
					});
				})
				.catch((error) => {
					console.log(error);
				});
		});
	};

	const hideLoadingModal = (callback: Function) => {
		setTimeout(() => {
			setShowLoading(false);
			callback();
		}, 1500);
	};

	const searchProduct = (text: any) => {
		const value = text.toLowerCase();
		setTimeout(() => {
			const products = productsSearch.filter(
				(item: any) => !!item.product_name && item.product_name.toLowerCase().includes(value)
			);
			setProducts(products);
		}, 1000);
	};

	const onRefresh = () => {
		fetchProduct();
	};

	return (
		<SafeAreaView style={styles.container}>
			<Loading showLoading={showLoading} translation={translation} />
			<View style={styles.body}>
				<View style={styles.formInputIcon}>
					<TextInput
						placeholder={translation.t('listProductsSearchPlaceholder') /* Search a name of a product */}
						placeholderTextColor={'gray'}
						style={[styles.textInput, { zIndex: 1 }]}
						onChangeText={searchProduct}
					/>
					<FontAwesome style={styles.inputIcon} name='search' size={20} onPress={() => { }} />
				</View>
				{(products && Object.keys(products).length > 0 && (
					<FlatList
						data={products}
						onRefresh={() => onRefresh()}
						refreshing={showLoading}
						renderItem={({ item }) => (
							<Pressable
								style={styles.productCard}
								key={item.id}
								onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
							>
								<View style={styles.productImage}>
									<Image
										source={{ uri: item.product_img }}
										style={{ flex: 1, resizeMode: 'contain' }}
									/>
								</View>
								<View style={{ justifyContent: 'space-between', width: 160 }}>
									<Text style={styles.productTitle}>{item.product_name}</Text>
									<View
										style={{
											flexDirection: 'row',
											justifyContent: 'space-between',
											marginTop: 20
										}}
									>
										<Text style={styles.productPrice}>${item.price}</Text>
									</View>
								</View>
							</Pressable>
						)}
					/>
				)) || <Text style={{ marginTop: 20, fontSize: 16 }}>No products available in this pharmacy...</Text>}
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
	productCard: {
		padding: 20,
		marginVertical: 4,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: 'rgba(0, 0, 0, 0.1)',
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center'
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
		fontWeight: '500'
	}
});
