import React from "react";
import { View, Text } from "react-native";
import WebView from "react-native-webview";
import HeaderComponent from "../components/Header";
import { Container } from "../components/Shared";

export default function ShopperScreen({ navigation }: any){
    return (
        <Container>
            <HeaderComponent />
            <WebView 
                style={{ marginTop: 40 }}
                source={{ uri: 'https://wixlabs-pdf-dev.appspot.com/index?pageId=uo55o&compId=comp-kr0o3sx0&viewerCompId=comp-kr0o3sx0&siteRevision=520&viewMode=site&deviceType=desktop&locale=en&tz=America%2FPuerto_Rico&regionalLanguage=en&width=958&height=1109&instance=TvTm6mEKNWcgwLZ1EeLffHaVr0e0H1zG3-5aIoUnUCI.eyJpbnN0YW5jZUlkIjoiNjc3YmRhZjgtZWM4NC00YTFkLWFiZWUtMTY4ODk5NzcwYzU5IiwiYXBwRGVmSWQiOiIxM2VlMTBhMy1lY2I5LTdlZmYtNDI5OC1kMmY5ZjM0YWNmMGQiLCJtZXRhU2l0ZUlkIjoiODMwNjM5ZDctZTI4MC00ZDQ5LTkzMzctMzY0M2ExNjQyNTIwIiwic2lnbkRhdGUiOiIyMDIxLTEyLTA4VDE1OjIyOjMzLjk1M1oiLCJkZW1vTW9kZSI6ZmFsc2UsImFpZCI6ImJkOWJmMjVjLTYxZWEtNDFkOS1iMjY4LTVhYmM4YjRlZTM3YSIsImJpVG9rZW4iOiJlNDdkZTMyZi0wZTA0LTA3NTQtMzhkOS0yMGNiMzgxMzI5NzkiLCJzaXRlT3duZXJJZCI6IjdlOWVhOWM3LTU0MTAtNGQ0Yi1iM2VhLTFmZTU2ZmQ5M2UzYiJ9&currency=USD&currentCurrency=USD&commonConfig=%7B%22brand%22%3A%22wix%22%2C%22bsi%22%3A%22fd330dcc-4da4-42af-9b96-43ad5f83d1bd%7C2%22%2C%22BSI%22%3A%22fd330dcc-4da4-42af-9b96-43ad5f83d1bd%7C2%22%7D&vsi=87eaeeab-93e2-451b-82b4-26d7dc1623ed' }}
            />
        </Container>
    )
}