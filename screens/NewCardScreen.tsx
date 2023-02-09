import { Formik, isObject } from 'formik';
import React, { useState } from 'react';
import { SafeAreaView, View, Text, Pressable, TextInput, StyleSheet, ScrollView } from 'react-native';
import { BottomPopup } from '../components/BottomPopup';
import * as yup from 'yup';
import { checkStorage, Loading } from '../components/Shared';
import { sendData } from '../httpRequests';
import Toast from 'react-native-root-toast';
import { LanguageContext } from '../LanguageContext';

export default function NewCardScreen({ navigation }: any) {
	const { translation } = React.useContext(LanguageContext);

	const validationSchema = yup.object().shape({
		name: yup.string().required(translation.t('cardNameRequiredText')), // Card name is required
		number: yup.string().required(translation.t('cardNumberRequiredText')), // Card number is required
		expirationMonth: yup.string().required(translation.t('cardExpirationMonthRequiredText')), // Expiration month is required
		expirationYear: yup.string().required(translation.t('cardExpirationYearRequiredText')), // Expiration year is required
		cvv: yup.string().required(translation.t('cardCVVRequiredText')) // CVV is required
	});

	const [showLoading, setShowLoading]: any = useState(false);

	const saveCard = (values: any) => {
		setShowLoading(true);
		checkStorage('USER_LOGGED', (userId: any) => {
			const url = '/user/getUserById';
			const data = { user_id: userId };
			sendData(url, data).then((response: any) => {
				if (Object.keys(response).length > 0) {
					const user = response['user'];
					const customerId = user.stripe_customer_id;
					if (customerId) addCard(user.id, values);
					else createNewCustomer(user, values);
				} else {
					hideLoadingModal(() => {
						showErrorToast(translation.t('httpConnectionError'));
					});
				}
			});
		});
	};

	const createNewCustomer = (user: any, card: any) => {
		const url = '/stripe/createCustomer';
		const data = {
			id: user.id,
			email: user.email,
			card_number: card.number,
			exp_month: card.expirationMonth,
			exp_year: card.expirationYear,
			cvc: card.cvv,
			fullName: user.first_name + ' ' + user.last_name
		};
		sendData(url, data).then((response: any) => {
			hideLoadingModal(() => {
				if (Object.keys(response).length > 0) {
					const customer = response['customer'];
					setDefaultCard(customer.default_source);
				}
			});
		});
	};

	const addCard = (userId: string, card: any) => {
		const url = '/stripe/addCard';
		const data = {
			id: userId,
			card_number: card.number,
			exp_month: card.expirationMonth,
			exp_year: card.expirationYear,
			cvc: card.cvv
		};
		sendData(url, data).then((response) => {
			hideLoadingModal(() => {
				if (Object.keys(response).length > 0) {
					const error = response['err'];
					if (isObject(error)) {
						showErrorToast(error['raw'].message);
					} else {
						const card = response['source'];
						setDefaultCard(card.id);
					}
				} else {
					showErrorToast(translation.t('httpConnectionError'));
				}
			});
		});
	};

	const setDefaultCard = (cardId: string) => {
		setShowLoading(true);
		checkStorage('USER_LOGGED', (userId: any) => {
			const url = '/user/getUserById';
			const data = {
				user_id: userId
			};
			sendData(url, data).then((response: any) => {
				hideLoadingModal(() => {
					const user = response['user'];
					const url = '/user/updateCliente';
					if (cardId != user.card_id) {
						const data = {
							user_id: user.id,
							email: user.email,
							first_name: user.first_name,
							last_name: user.last_name,
							client_direction_id: user.client_direction_id,
							card_id: cardId
						};
						sendData(url, data).then((response: any) => {
							navigation.goBack();
						});
					}
				});
			});
		});
	};

	const hideLoadingModal = (callback: Function) => {
		setTimeout(() => {
			setShowLoading(false);
			callback();
		}, 1500);
	};

	const showErrorToast = (message: string) => {
		Toast.show(message, {
			duration: Toast.durations.LONG,
			containerStyle: { backgroundColor: 'red', width: '80%' }
		});
	};

	let popupRef: any = React.createRef();

	const onShowPopup = () => {
		popupRef.show();
	};

	const onClosePopup = () => {
		popupRef.close();
	};

	return (
		<SafeAreaView style={styles.container}>
			<Loading showLoading={showLoading} translation={translation} />
			<View style={styles.body}>
				<Formik
					validationSchema={validationSchema}
					initialValues={{ name: '', number: '', expirationMonth: '', expirationYear: '', cvv: '' }}
					onSubmit={(values) => {
						saveCard(values);
					}}
				>
					{({ handleChange, handleBlur, handleSubmit, values, errors }) => (
						<>
							<ScrollView style={{ flex: 1 }}>
								<Text style={styles.labelInput}>{translation.t('cardNameLabel') /* Card Name */}</Text>
								<TextInput
									style={styles.textInput}
									onChangeText={handleChange('name')}
									onBlur={handleBlur('name')}
									value={values.name}
								/>
								<Text style={styles.labelInput}>
									{translation.t('cardNumberLabel') /* Card Number */}
								</Text>
								<TextInput
									maxLength={16}
									style={styles.textInput}
									onChangeText={handleChange('number')}
									onBlur={handleBlur('number')}
									value={values.number}
									keyboardType='numeric'
								/>
								<View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
									<View style={{ width: '45%', marginRight: 10 }}>
										<Text style={styles.labelInput}>
											{translation.t('cardExpirationMonthLabel') /* Expiration Month */}
										</Text>
										<TextInput
											style={styles.textInput}
											onChangeText={handleChange('expirationMonth')}
											onBlur={handleBlur('expirationMonth')}
											value={values.expirationMonth}
											keyboardType='numeric'
										/>
									</View>
									<View style={{ width: '45%' }}>
										<Text style={styles.labelInput}>
											{translation.t('cardExpirationYearLabel') /* Expiration Year */}
										</Text>
										<TextInput
											style={styles.textInput}
											onChangeText={handleChange('expirationYear')}
											onBlur={handleBlur('expirationYear')}
											value={values.expirationYear}
											keyboardType='numeric'
										/>
									</View>
								</View>
								<Text style={styles.labelInput}>{translation.t('cardCVVLabel') /* CVV */}</Text>
								<TextInput
									style={styles.textInput}
									onChangeText={handleChange('cvv')}
									onBlur={handleBlur('cvv')}
									value={values.cvv}
									keyboardType='numeric'
								/>
							</ScrollView>
							<BottomPopup
								ref={(target) => (popupRef = target)}
								onTouchOutside={onClosePopup}
								title={'Alert'}
								errors={errors}
							/>
							<Pressable
								style={styles.registerButton}
								onPress={() => (Object.keys(errors).length > 0 ? onShowPopup() : handleSubmit())}
							>
								<Text style={styles.registerButtonText}>
									{translation.t('cardButtonSaveText') /* Save Card */}
								</Text>
							</Pressable>
						</>
					)}
				</Formik>
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
		height: 350,
		borderRadius: 20,
		flex: 1
	},
	labelInput: {
		fontSize: 15,
		color: '#8B8B97',
		fontWeight: '500',
		marginTop: 10
	},
	textInput: {
		marginTop: 10,
		marginBottom: 10,
		height: 50,
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
	}
});
