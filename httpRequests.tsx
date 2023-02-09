import axios from 'axios';

const baseUrl = 'https://coopharma-api-zd5is.ondigitalocean.app/api';

const fetchData = async (url: string) => {
	try {
		const configuration: any = {
			method: 'get',
			url: `${baseUrl}` + url
		};

		const response = await axios(configuration);
		return response.data;
	} catch (error) {
		console.log(error);
		return {};
	}
};

const sendData = async (url: string, data: {}) => {
	try {
		const configuration: any = {
			method: 'post',
			url: `${baseUrl}` + url,
			data: data
		};

		const response = await axios(configuration);
		return response.data;
	} catch (error) {
		console.log(error);
		return {};
	}
};

const sendDataPut = async (url: string, data: {}) => {
	try {
		const configuration: any = {
			method: 'put',
			url: `${baseUrl}` + url,
			data: data
		};

		const response = await axios(configuration);
		return response.data;
	} catch (error) {
		console.log(error);
		return {};
	}
};

export { fetchData, sendData, sendDataPut };
