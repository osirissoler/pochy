import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, Modal, TextInput, ScrollView, Alert } from 'react-native';
import HeaderComponent from '../components/Header';
import { checkLoggedUser, checkStorage, Container } from '../components/Shared';
import { FontAwesome, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Formik } from 'formik';
import * as yup from 'yup';
import { LanguageContext } from '../LanguageContext';

const validationSchema = yup.object().shape({
	senderName: yup.string().required('Sender name is required'),
	senderFaxNumber: yup.string().required('Sender fax number is required'),
	senderEmail: yup.string().email('Please enter valid sender email').required('Sender email is required'),
	receiverName: yup.string().required('Receiver name is required'),
	receiverFaxNumber: yup.string().required('Receiver fax number is required'),
	receiverEmail: yup.string().email('Please enter valid receiver email').required('Receiver email is required')
});

export default function ServiceScreen({ navigation }: any) {
	const { translation } = React.useContext(LanguageContext);

	useEffect(() => {
		//checkLoggedUser(() => {}, navigation, translation);
		Alert.alert(
			translation.t('alertWarningTitle'),
			translation.t('alertServiceUnavailableText') /* Service unavailable at the moment */,
			[
				{
					text: 'Ok',
					onPress: () => {
						checkStorage('USER_PHARMACY', (response: any) => {
							const pharmacy = JSON.parse(response);
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
						});
					}
				}
			]
		);
	}, []);

	return (
		<Container>
			{/* <HeaderComponent />
			<Text style={styles.title}>Services</Text>
			<View>
				<ServiceComponent title='Send Fax' icon='fax' navigation={navigation} />
			</View> */}
		</Container>
	);
}

function ServiceComponent({ title, icon, navigation }: any) {
	const [showModal, setShowModal]: any = useState(false);

	const openModal = () => {
		setShowModal(true);
	};

	const closeModal = () => {
		setShowModal(false);
	};

	return (
		<>
			<TouchableOpacity style={styles.productCard} onPress={() => openModal()}>
				<View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 }}>
					<FontAwesome name={icon} size={30} style={styles.productIcon} />
					<Text style={styles.productTitle}>{title}</Text>
				</View>
				<Pressable>
					<MaterialIcons name='keyboard-arrow-right' size={30} />
				</Pressable>
			</TouchableOpacity>
			<Modal visible={showModal} animationType='slide'>
				<View style={{ paddingVertical: 40, paddingHorizontal: 20 }}>
					<View style={{ position: 'relative', justifyContent: 'center' }}>
						<Text style={{ fontSize: 16, textAlign: 'center', marginTop: 20, marginBottom: 30 }}>
							{title}
						</Text>
						<View style={{ position: 'absolute', right: 0 }}>
							<MaterialCommunityIcons
								name='close'
								size={24}
								style={{ marginBottom: 15 }}
								onPress={() => closeModal()}
							/>
						</View>
					</View>
					<Formik
						validationSchema={validationSchema}
						initialValues={{
							senderName: '',
							senderFaxNumber: '',
							senderEmail: '',
							receiverName: '',
							receiverFaxNumber: '',
							receiverEmail: '',
							file: ''
						}}
						onSubmit={(values) => console.log(values)}
					>
						{({ handleChange, handleBlur, handleSubmit, values, isValid, errors, touched }) => (
							<ScrollView>
								<View
									style={{
										flexDirection: 'row',
										justifyContent: 'space-between',
										alignItems: 'center'
									}}
								>
									<View style={{ width: '45%' }}>
										<Text style={{ fontSize: 16, marginVertical: 10 }}>Sender info</Text>
										<Text style={styles.labelInput}>Name</Text>
										<TextInput
											style={styles.textInput}
											onChangeText={handleChange('senderName')}
											onBlur={handleBlur('senderName')}
											value={values.senderName}
										/>
										{touched.senderName && errors.senderName && (
											<Text style={{ color: 'red' }}>{errors.senderName}</Text>
										)}
										<Text style={styles.labelInput}>Fax Number</Text>
										<TextInput
											style={styles.textInput}
											onChangeText={handleChange('senderFaxNumber')}
											onBlur={handleBlur('senderFaxNumber')}
											value={values.senderFaxNumber}
										/>
										{touched.senderFaxNumber && errors.senderFaxNumber && (
											<Text style={{ color: 'red' }}>{errors.senderFaxNumber}</Text>
										)}
										<Text style={styles.labelInput}>Email</Text>
										<TextInput
											style={styles.textInput}
											onChangeText={handleChange('senderEmail')}
											onBlur={handleBlur('senderEmail')}
											value={values.senderEmail}
										/>
										{touched.senderEmail && errors.senderEmail && (
											<Text style={{ color: 'red' }}>{errors.senderEmail}</Text>
										)}
									</View>
									<View style={{ width: '45%' }}>
										<Text style={{ fontSize: 16, marginVertical: 10 }}>Receiver info</Text>
										<Text style={styles.labelInput}>Name</Text>
										<TextInput
											style={styles.textInput}
											onChangeText={handleChange('receiverName')}
											onBlur={handleBlur('receiverName')}
											value={values.receiverName}
										/>
										{touched.receiverName && errors.receiverName && (
											<Text style={{ color: 'red' }}>{errors.receiverName}</Text>
										)}
										<Text style={styles.labelInput}>Fax Number</Text>
										<TextInput
											style={styles.textInput}
											onChangeText={handleChange('receiverFaxNumber')}
											onBlur={handleBlur('receiverFaxNumber')}
											value={values.receiverFaxNumber}
										/>
										{touched.receiverFaxNumber && errors.receiverFaxNumber && (
											<Text style={{ color: 'red' }}>{errors.receiverFaxNumber}</Text>
										)}
										<Text style={styles.labelInput}>Email</Text>
										<TextInput
											style={styles.textInput}
											onChangeText={handleChange('receiverEmail')}
											onBlur={handleBlur('receiverEmail')}
											value={values.receiverEmail}
										/>
										{touched.receiverEmail && errors.receiverEmail && (
											<Text style={{ color: 'red' }}>{errors.receiverEmail}</Text>
										)}
									</View>
								</View>
								<View
									style={{
										height: 200,
										borderColor: 'rgba(0, 0, 0, 0.2)',
										borderWidth: 1,
										borderStyle: 'dashed',
										marginTop: 30,
										justifyContent: 'center',
										alignItems: 'center'
									}}
								>
									<FontAwesome name='file-text-o' size={60} color={'rgba(0, 0, 0, 0.1)'} />
								</View>
								<TouchableOpacity
									style={[
										{
											width: '100%',
											height: 50,
											backgroundColor: '#128780',
											alignItems: 'center',
											justifyContent: 'center',
											borderRadius: 10,
											marginTop: 40
										},
										!isValid && { backgroundColor: '#12878050' }
									]}
									onPress={() => handleSubmit()}
								>
									<Text style={{ color: '#ffffff', fontSize: 18 }}>Send</Text>
								</TouchableOpacity>
							</ScrollView>
						)}
					</Formik>
				</View>
			</Modal>
		</>
	);
}

const styles = StyleSheet.create({
	title: {
		marginVertical: 20,
		fontSize: 18,
		textAlign: 'center',
		fontWeight: '700',
		color: '#000'
	},
	productCard: {
		padding: 15,
		height: 100,
		paddingHorizontal: 20,
		marginVertical: 10,
		marginHorizontal: 20,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: 'rgba(0, 0, 0, 0.1)',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center'
	},
	productIcon: {
		paddingRight: 20
	},
	productTitle: {
		fontSize: 18,
		fontWeight: '500'
	},
	productPrice: {
		fontSize: 16,
		fontWeight: '500'
	},
	productAdd: {
		borderColor: 'rgba(0, 0, 0, 0.2)',
		borderWidth: 1,
		height: 20,
		width: 20,
		borderRadius: 100,
		justifyContent: 'center',
		alignItems: 'center'
	},
	productAddIcon: {
		color: '#ffffff'
	},
	labelInput: {
		fontSize: 15,
		color: '#8B8B97',
		marginTop: 10
	},
	textInput: {
		height: 40,
		width: '100%',
		borderColor: '#F7F7F7',
		borderWidth: 2,
		backgroundColor: '#FFFFFF',
		paddingRight: 35,
		paddingLeft: 20,
		borderRadius: 5,
		marginBottom: 10
	}
});
