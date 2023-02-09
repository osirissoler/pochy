import React, { useState,useCallback } from 'react';
import { Text, View,Linking,Alert ,FlatList, TouchableOpacity, StyleSheet, TextInput, ScrollView, Button } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Formik } from 'formik';
import * as yup from 'yup';
import HeaderComponent from '../components/Header';
import { checkStorage, Container, Loading } from '../components/Shared';
import { BottomPopup } from '../components/BottomPopup';
import { sendData } from '../httpRequests';
import Toast from 'react-native-root-toast';
import asyncStorage from '@react-native-async-storage/async-storage';
import { LanguageContext } from '../LanguageContext';
import { CheckBox, Separator } from "react-native-btr";
import BouncyCheckbox from 'react-native-bouncy-checkbox';
export default function SignUpScreen({ navigation }: any) {
	const { translation } = React.useContext(LanguageContext);
	const [showLoading, setShowLoading]: any = useState(false);
	const [termAndCoditionAccepted, settermAndCoditionAccepted] = useState(false)

	const validationSchema = yup.object().shape({
		fullName: yup.string().required(translation.t('signUpFullNameRequiredText') /* First name is required */),
		phone: yup.string().required(translation.t('signUpPhoneNumberRequiredText') /* Phone number is required */),
		email: yup
			.string()
			.email(translation.t('signUpEmailValidationText') /* Please enter valid email */)
			.required(translation.t('signUpEmailRequiredText') /* Email is required */),
		password: yup
			.string()
			.matches(
				/\w*[a-z]\w*/,
				translation.t('signUpPasswordValidationSmallLetterText') /*Password must have a small letter */
			)
			.matches(
				/\w*[A-Z]\w*/,
				translation.t('signUpPasswordValidationCapitalLetterText') /* Password must have a capital letter */
			)
			.matches(/\d/, translation.t('signUpPasswordValidationNumberText') /* Password must have a number */)
			.min(
				8,
				({ min }) =>
					translation.t('signUpPasswordValidationCharactersText') +
					min /* `Password must be at least ${min} characters` */
			)
			.required(translation.t('signUpPasswordRequiredText') /* Password is required */),
		passwordConfirmation: yup
			.string()
			.oneOf([yup.ref('password')], translation.t('signUpPasswordMatchErrorText') /* Passwords do not match */)
			.required(translation.t('signUpPasswordConfirmationRequiredText') /* Confirm password is required */)
	});

	const onSignUp = (values: any) => {
		setShowLoading(true);
		const url = '/user/createClient';
		const data = {
			firstName: values.fullName,
			lastName: '',
			email: values.email,
			phone: values.phone,
			password: values.password
		};
		console.log(data)
		sendData(url, data)
			.then((response) => {
				hideLoadingModal(() => {
					if (Object.keys(response).length > 0) {
						const url = '/auth/login';
						sendData(url, values).then((response: any) => {
							setAuthUser(response.id);
						});
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
	};

	const setAuthUser = (id: number) => {
		asyncStorage.setItem('USER_LOGGED', id + '');
		checkStorage('USER_PHARMACY', (response: any) => {
			const pharmacy = JSON.parse(response);
			if (!!response) {
				navigation.reset({
					index: 0,
					routes: [
						{
							name: 'Root',
							params: { phId: 560, phName: pharmacy.name },
							screen: 'Home'
						}
					]
				});
			} else {
				navigation.reset({
					index: 0,
					routes: [
						{
							name: 'ListPharmacies'
						}
					]
				});
			}
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

	function InputPassword({ handleChange, handleBlur, value, label, name }: any) {
		const [showPassword, setShowPassword]: any = useState(false);
		const [passwordIcon, setPasswordIcon]: any = useState('eye-slash');

		const toggleShowPassword = () => {
			if (showPassword) {
				setShowPassword(false);
				setPasswordIcon('eye-slash');
			} else {
				setShowPassword(true);
				setPasswordIcon('eye');
			}
		};

		return (
			<>
				<Text style={styles.labelInput}>{label}</Text>
				<View style={styles.formInputIcon}>
					<TextInput
						style={[styles.textInput, { zIndex: 1 }]}
						onChangeText={handleChange(name)}
						onBlur={handleBlur(name)}
						value={value}
						secureTextEntry={!showPassword}
						keyboardType={!showPassword ? undefined : 'visible-password'}
					/>
					<FontAwesome
						style={styles.inputIcon}
						name={passwordIcon}
						size={16}
						onPress={() => toggleShowPassword()}
					/>
				</View>
			</>
		);
	}
	const [data, setData] = useState([
		{ title: "Default" },
		{ title: "Colored", checked: true, color: "#08f" },
		{ title: "Disabled", checked: true, disabled: true },
	]);

	function toggle(index: number) {
		const item = data[index];
		item.checked = !item.checked;
		setData([...data]);
	}
	
	const supportedURL = "https://coopharma-83beb.web.app/termsandconditions";

	const unsupportedURL = "slack://open?team=123456";
	
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
	
	  return <Button title={children} onPress={handlePress} />;
	};
	return (
		<Container style={{ backgroundColor: '#f7f7f7', flex: 1 }} keyboard={true}>
			<HeaderComponent navigation={navigation} />
			<Loading showLoading={showLoading} translation={translation} />
			<Text style={styles.title}>{translation.t('signUpTitle') /*  Sign Up */}</Text>
			<View style={styles.body}>
				<View style={{ padding: 20 }}>
					<Formik
						validationSchema={validationSchema}
						initialValues={{
							fullName: '',
							email: '',
							phone: '',
							password: '',
							passwordConfirmation: ''
						}}
						onSubmit={(values) => onSignUp(values)}
					>
						{({ handleChange, handleBlur, handleSubmit, values, isValid, errors, touched }) => (
							<View>
								<Text style={styles.labelInput}>
									{translation.t('userFullNameLabel') /*  Full Name */}
								</Text>
								<TextInput
									style={styles.textInput}
									onChangeText={handleChange('fullName')}
									onBlur={handleBlur('fullName')}
									value={values.fullName}
								/>
								<Text style={styles.labelInput}>{translation.t('userEmailLabel') /*  Email */}</Text>
								<TextInput
									style={styles.textInput}
									onChangeText={handleChange('email')}
									onBlur={handleBlur('email')}
									value={values.email}
									keyboardType='email-address'
									autoCapitalize='none'
								/>
								<Text style={styles.labelInput}>
									{translation.t('userPhoneNumberLabel') /*  Phone Number */}
								</Text>
								<TextInput
									style={styles.textInput}
									onChangeText={handleChange('phone')}
									onBlur={handleBlur('phone')}
									value={values.phone}
									keyboardType='numeric'
								/>
								<InputPassword
									handleChange={handleChange}
									handleBlur={handleBlur}
									value={values.password}
									label={translation.t('userPasswordLabel') /*  Password */}
									name={'password'}
								/>
								<InputPassword
									handleChange={handleChange}
									handleBlur={handleBlur}
									value={values.passwordConfirmation}
									label={translation.t('userPasswordConfirmationLabel') /*  Password Confirmation */}
									name={'passwordConfirmation'}
								/>
								<View style={{...styles.row}}>
									{/* <Text style={styles.termCoditions}> */}
									<BouncyCheckbox
										size={25}
										fillColor="#128780"
										textStyle={{
											textDecorationLine: "none",
											color: "#128780"
										}}
										
										//disableText
										//textStyle={{color:"red"}}
										// unfillColor="#FFFFFF"
										disableText
										text={translation.t('profileTermsText')}
										//iconStyle={{ borderColor: "#128780" }}
										//innerIconStyle={{ borderWidth: 2 }}
										onPress={(isChecked: boolean) => { settermAndCoditionAccepted(isChecked);console.log(termAndCoditionAccepted) }}
									//style={{paddingVertical:0}}
				

									/>
									{/* {translation.t('profileTermsText')}
								</Text> */}
													<OpenURLButton  url={supportedURL}>{translation.t('profileTermsText')}</OpenURLButton>

								</View>
								<TouchableOpacity
									disabled={!termAndCoditionAccepted}
									style={termAndCoditionAccepted?styles.registerButton:styles.registerButtonDisabled}
									onPress={() => (Object.keys(errors).length > 0 ? onShowPopup() : handleSubmit())}
								>
									<Text style={styles.registerButtonText} >
										{translation.t('signUpButtonText') /*  Register */}
									</Text>
								</TouchableOpacity>
								{/* <View >
									<CheckBox
										checked={true}
										color={"#000"}
										disabled={false}
										onPress={() => {}}
									/>
									<Text style={styles.label}>Accep terms</Text>
								</View> */}
								<BottomPopup
									ref={(target) => (popupRef = target)}
									onTouchOutside={onClosePopup}
									title={'Alert'}
									errors={errors}
								/>
							</View>
						)}
					</Formik>
				</View>
			</View>
			<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
				<Text style={styles.loginText}>
					{translation.t('signUpExistingAccount') /*  Already have an account? */}
				</Text>
				<Text style={styles.loginLink} onPress={() => navigation.navigate('SignIn')}>
					{translation.t('signInTitle') /*  Sign In */}
				</Text>
			</View>
		</Container>
	);
}

const styles = StyleSheet.create({
	termCoditions: {
		// flex: 1,
		paddingHorizontal: 16,
		// marginBottom:40,
		color: "#128780",

	},

	container: {
		flex: 1,
		justifyContent: "center",
	},
	row: {
		flexDirection: "row",
		backgroundColor: "#fff",
		alignItems: "center",
		padding: 16,
	},
	label: {
		flex: 1,
		paddingHorizontal: 16,
	},
	body: {
		marginHorizontal: 15,
		backgroundColor: '#ffffff',
		borderRadius: 30
	},
	title: {
		fontSize: 36,
		fontWeight: '300',
		marginBottom: 5,
		paddingLeft: 25
	},
	labelInput: {
		fontSize: 15,
		color: '#8B8B97',
		marginTop: 10
	},
	textInput: {
		height: 50,
		width: '100%',
		borderColor: '#F7F7F7',
		borderWidth: 2,
		backgroundColor: '#FFFFFF',
		paddingRight: 45,
		paddingLeft: 20,
		borderRadius: 5
	},
	formInputIcon: {
		position: 'relative',
		flexDirection: 'row'
	},
	inputIcon: {
		position: 'absolute',
		right: 5,
		top: '15%',
		zIndex: 2,
		padding: 10
	},
	errorText: {
		maxHeight: 20,
		textAlign: 'center'
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
	registerButtonDisabled: {
		width: '100%',
		height: 50,
		backgroundColor: '#ccc',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 10,
		marginTop: 20
	},
	
	registerButtonText: {
		color: '#ffffff',
		fontSize: 18
	},
	loginText: {
		textAlign: 'center',
		fontSize: 14
	},
	loginLink: {
		padding: 5,
		color: '#40AA54'
	}
});
