import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Formik } from 'formik';
import * as yup from 'yup';
import { LanguageContext } from '../LanguageContext';
import { sendData } from '../httpRequests';
import { Loading } from '../components/Shared';

export default function ForgotPasswordScreen({ navigation }: any) {
	const { translation } = React.useContext(LanguageContext);
	const [showLoading, setShowLoading]: any = useState(false);

	const validationSchema = yup.object().shape({
		email: yup
			.string()
			.email(translation.t('signUpEmailValidationText') /* Please enter valid email */)
			.required(translation.t('signUpEmailRequiredText') /* Email is required */)
	});

	const resetEmail = (values: { email: string }) => {
		setShowLoading(true);
		const email = values.email;
		const url = '/user/forgetPasswordUser';
		const data = {
			email: email
		};
		sendData(url, data).then((response: any) => {
			hideLoadingModal(() => {
				if (Object.keys(response).length > 0) {
					Alert.alert(
						translation.t('alertInfoTitle'), // Information
						translation.t('emailSentText'), // Instructions sent to your email
						[
							{
								text: 'Ok'
							}
						]
					);
				}
			});
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
				<Text style={styles.title}>{translation.t('forgotPasswordTitle') /* Reset your password */}</Text>
				<Text style={styles.subTitle}>
					{
						translation.t(
							'forgotPasswordMessage'
						) /* Please enter your email. We will send you the instructions on how to reset your password. */
					}
				</Text>
				<Formik validationSchema={validationSchema} initialValues={{ email: '' }} onSubmit={resetEmail}>
					{({ handleChange, handleBlur, handleSubmit, values, isValid, errors, touched }) => (
						<View>
							<Text style={styles.labelInput}>{translation.t('userEmailLabel')}</Text>
							<TextInput
								style={styles.textInput}
								autoCapitalize='none'
								value={values.email}
								onChangeText={handleChange('email')}
								onBlur={handleBlur('email')}
								keyboardType='email-address'
							/>
							<View style={{ marginBottom: 20, marginTop: 10, height: 15 }}>
								{errors.email && touched.email && <Text>{errors.email}</Text>}
							</View>

							<TouchableOpacity
								style={[styles.resetButton, !isValid && { backgroundColor: '#12878050' }]}
								onPress={() => handleSubmit()}
								disabled={!isValid}
							>
								<Text style={styles.resetButtonText}>
									{translation.t('forgotPasswordButtonSendText') /* Send link */}
								</Text>
							</TouchableOpacity>
						</View>
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
		borderRadius: 20
	},
	title: {
		fontSize: 22,
		marginTop: 20
	},
	subTitle: {
		fontSize: 15,
		color: '#8B8B97',
		fontWeight: '300',
		marginVertical: 15
	},
	labelInput: {
		fontSize: 15,
		color: '#8B8B97',
		marginTop: 30
	},
	textInput: {
		marginTop: 10,
		height: 50,
		width: '100%',
		borderColor: '#F7F7F7',
		borderWidth: 2,
		backgroundColor: '#FFFFFF',
		paddingRight: 35,
		paddingLeft: 20,
		borderRadius: 5
	},
	resetButton: {
		width: '100%',
		height: 50,
		backgroundColor: '#128780',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 10
	},
	resetButtonText: {
		color: '#ffffff',
		fontSize: 18
	}
});
