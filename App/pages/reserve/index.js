import React, { Component } from 'react';
import { StyleSheet, Dimensions, Alert, Platform, StatusBar, View, Text, FlatList, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import { Ionicons as Icon, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { Container, Header, Left, Body, Right, Button, Title, Item, Input } from 'native-base';
import { Constants } from 'expo';
import Toolbar from '../../controls/toolbars';
import MyStatusBar from '../statusBar/MyStatusBar';
import Create from './create';
import GuestsItem from './reserveItem';
import axios from 'axios';
import ReserveDetail from './detailReserve';
import { API_URL } from '../constants/Config';
const ios = Platform.OS === 'ios';
const { height } = Dimensions.get('window');
const { width } = Dimensions.get('window');
class AllGuests extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            loading: false,
            refreshing: false,
            showCreate: false,
            showCreateIpad: height >= 1024 ? true : false,
            data: [],
            currentReserve: null,
            showDetailRes: false,
            error: null,
            isVisible: 'showModalCreate',
        }
        this.arrayholder = [];
    }

    componentDidMount() {
        var urlItem = `${API_URL}/wp-json/sections_endpoint/v2/reserves`;
        return axios.get(`${urlItem}`).then(response => {
            this.setState({
                data: response.data
            })
            this.arrayholder = response.data;
        })
            .catch(err => console.log(err));
    }

    getActionMenu = () => {
        return [
            {
                icon: <MaterialIcons name='add' style={{ fontSize: 22, color: '#fff', paddingRight: 5 }} />,
                onPress: () => this.create()
            }
        ];
    }

    showFilter = (show) => {
        this.setState({ showFilter: show });
        this.showBox(null)
    }


    create = () => {
        this.setState({ showCreate: true })
    }

    showBox = (data, box = '') => {
        this.setState({ currentReserve: data, currentBox: box, isVisible: 'showModalDetail' });
    }

    onToggleModal = () => {
        this.setState({
            isVisible: 'showModalCreate'
        })
    }

    showMenu = () => {
        this.props.navigation.openDrawer();
    }

    renderHeader = () => {
        return (
            <View>
                {this.state.data.length == 0 &&
                    <View style={{ alignItems: 'center' }}><Text style={{ padding: 10 }}>The list is empty</Text></View>
                }
            </View>
        );
    };

    searchFilterFunction = text => {
        const newData = this.arrayholder.filter(item => {

            const itemData = `${item.post_title.toUpperCase()}`;
            //   ${item.first_name[0].toUpperCase()} ${item.last_name.toUpperCase()}`;

            const textData = text.toUpperCase();

            return itemData.indexOf(textData) > -1;
        });
        this.setState({ data: newData });
    };

    refresh = () => {
        var urlItem = `${API_URL}/wp-json/sections_endpoint/v2/reserves`;
        this.setState({ refreshing: true });
        axios.get(`${urlItem}`).then(response => {
            this.setState({
                refreshing: false,
                data: response.data
            })
            this.arrayholder = response.data;
        })
            .catch(this.setState({
                refreshing: false
            }));
    }

    render() {
        const dataCus = this.state.data;
        const actions = this.getActionMenu();
        return (
            <View style={[height >= 1024 ? styles.wraper : styles.container]}>
                <View style={[height >= 1024 ? styles.containerIpad : styles.container]}>
                    {ios ? <StatusBar backgroundColor='#ffa06c' barStyle='light-content' /> : <MyStatusBar backgroundColor='#ffa06c' barStyle='light-content' />}
                    {height >= 1024 ?
                        <Header style={{ backgroundColor: '#ffa06c', borderBottomWidth: 0 }}>
                            <Left>
                                <Button transparent onPress={this.showMenu}>
                                    <MaterialIcons name='menu' style={{ fontSize: 22, color: '#fff' }} />
                                </Button>
                            </Left>
                            <Body>
                                <Title style={{ color: '#fff' }}>All guests</Title>
                            </Body>
                            <Right>
                                <Button transparent onPress = {this.onToggleModal}>
                                    <MaterialIcons name='add' style={{ fontSize: 22, color: '#fff', paddingRight: 5 }} />
                                </Button>
                            </Right>
                        </Header>
                        :
                        <Toolbar
                            noShadow
                            icon={<MaterialIcons name='menu' style={{ fontSize: 22, color: '#fff' }} />}
                            actions={actions}
                            onIconPress={this.showMenu}
                            titleText='All guests'
                            style={styles.toolbar}
                        ></Toolbar>
                    }
                    <View>
                        <Header searchBar rounded autoCorrect={false} style={[height >= 1024 ? { backgroundColor: '#fff' } : { backgroundColor: '#ffa06c' }]}>
                            <Item style={[ios ? { padding: 5 } : { padding: 10 }]}>
                                <Icon name="ios-search" style={{ fontSize: 20 }} />
                                <Input
                                    onChangeText={text => this.searchFilterFunction(text)}
                                    placeholder="Search"
                                />
                            </Item>
                        </Header>
                        {/*this.state.data.length == 0 &&
                            <View style={{ alignItems: 'center' }}><Text style={{ padding: 10 }}>The list is empty</Text></View>
                        */}
                    </View>
                    {
                        <FlatList
                            style={styles.listView}
                            data={dataCus}
                            keyExtractor={item => 'ID' + item.ID}
                            renderItem={this.renderItem}
                            refreshControl={
                                <RefreshControl
                                    tintColor="#28cc54"
                                    title="Loading..."
                                    titleColor="#00ff00"
                                    colors={['#28cc54', '#00ff00', '#ff0000']}
                                    refreshing={this.state.refreshing}
                                    onRefresh={this.refresh}
                                />
                            }
                            ListHeaderComponent={this.renderHeader}
                        />
                    }

                    {
                        height < 1024 &&
                    <ReserveDetail
                        refresh={() => this.refresh()}
                        data={this.state.currentReserve}
                        open={this.state.currentReserve != null && this.state.currentBox == "reserveDetail"}
                        onRequestClose={() => this.showBox(null)}
                    />
                    }
                    {
                        height < 1024 &&
                        <Create
                            onRequestClose={() => this.setState({ showCreate: false })}
                            refresh={() => this.refresh()}
                            show={this.state.showCreate}
                        />
                    }
                </View>
                {
                    height >= 1024 && this.state.isVisible == 'showModalCreate' &&
                    <View style={styles.containerIpad1}>
                        <Create
                            onRequestClose={() => this.setState({ showCreate: false })}
                            refresh={() => this.refresh()}
                            show={this.state.showCreateIpad}
                            showCreateIpad
                        />
                    </View>
                }
                {
                    height >= 1024 && this.state.currentBox == 'reserveDetail' && this.state.isVisible == 'showModalDetail' &&
                    <View style={styles.containerIpad1}>
                        <ReserveDetail
                            data={this.state.currentReserve}
                            onRequestClose={() => this.showBox(null)}
                            refresh={() => this.refresh()}
                            open={this.state.currentReserve != null && this.state.currentBox == "reserveDetail"}
                            showDetailIpad
                        />
                    </View>
                }
            </View>
        )

    }

    renderItem = ({ item }) => {
        return (
            <GuestsItem data={item} showBox={this.showBox} />
        );
    }

}

export default AllGuests;

const styles = StyleSheet.create({
    wraper: {
        flex: 1,
        flexDirection: 'row'
    },
    container: {
        flex: 1,
        backgroundColor: '#f3f3f3',
    },
    containerIpad: {
        flex: 1,
    },
    containerIpad1: {
        flex: 2,
    },
    header: {
        paddingTop: Constants.statusBarHeight,
    },
    tabBar: {
        backgroundColor: '#4CAF50',
        maxHeight: 70,
        minHeight: 40,
    },
    indicator: {
        backgroundColor: '#fff',
    },
    actionIcon: {
        padding: 5,
    },
    sizeIcon: {
        fontSize: 20
    },
    toolbar: {
        backgroundColor: '#ffa06c'
    },
    addBtn: {
        backgroundColor: '#ffa06c',
        padding: 15,
        margin: 15,
        marginBottom: 10,
        alignItems: 'center',
        borderRadius: 30
    }
});