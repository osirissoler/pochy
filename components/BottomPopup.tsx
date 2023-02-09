import React from 'react';
import { Modal, Dimensions, TouchableWithoutFeedback, StyleSheet, View, Text, FlatList, Pressable } from 'react-native';

const deviceHeight = Dimensions.get('window').height;
export class BottomPopup extends React.Component {
	constructor(props: any) {
		super(props);
		this.state = {
			show: false
		};
	}

	show = () => {
		this.setState({ show: true });
	};

	close = () => {
		this.setState({ show: false });
	};

	renderOutsideTouchable(onTouch: any) {
		const view = <View style={{ flex: 1, width: '100%' }}></View>;
		if (!onTouch) return view;

		return (
			<TouchableWithoutFeedback style={{ flex: 1, width: '100%' }} onPress={onTouch}>
				{view}
			</TouchableWithoutFeedback>
		);
	}

	renderTitle = () => {
		const { title }: any = this.props;

		return (
			<View style={{ alignItems: 'center' }}>
				<Text style={{ color: '#182E44', fontSize: 20, fontWeight: '500', marginTop: 15, marginBottom: 30 }}>
					{title}
				</Text>
			</View>
		);
	};

	renderContent = () => {
		const { errors }: any = this.props;
		let data: String[] = [];
		for (let key in errors) {
			data.push(errors[key]);
		}

		return (
			<View style={{ paddingBottom: 40, paddingHorizontal: 10 }}>
				{Object.keys(errors).length > 0
					? data.map((error, index) => (
							<Text key={index} style={{ fontSize: 16, marginVertical: 5 }}>
								{error}
							</Text>
					  ))
					: <Text style={{ fontSize: 16, marginVertical: 5 }}>
                    Please fill the required fields
                </Text>}

				<Pressable
					onPress={() => this.close()}
					style={{
						backgroundColor: '#128780',
						height: 50,
						marginVertical: 15,
						borderRadius: 10,
						justifyContent: 'center',
						alignItems: 'center'
					}}
				>
					<Text style={{ fontSize: 16, color: '#fff' }}>Continue</Text>
				</Pressable>
			</View>
		);
	};

	render() {
		let { show }: any = this.state;
		const { onTouchOutside }: any = this.props;

		return (
			<Modal animationType={'fade'} transparent={true} visible={show} onRequestClose={this.close}>
				<View style={{ flex: 1, backgroundColor: '#00000060', justifyContent: 'flex-end' }}>
					{this.renderOutsideTouchable(onTouchOutside)}
					<View
						style={{
							backgroundColor: '#ffffff',
							width: '100%',
							borderTopRightRadius: 10,
							borderTopLeftRadius: 10,
							paddingHorizontal: 10,
							maxHeight: deviceHeight
						}}
					>
						{this.renderTitle()}
						{this.renderContent()}
					</View>
				</View>
			</Modal>
		);
	}
}
