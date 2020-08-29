import React, {Component} from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap';
import './App.css';
import './css/main.css';
import './css/style.css';
import './css/common.css';
import './css/all.min.css';
import './css/jquery.fancybox.min.css';
// import './css/owl.carousel.min.css';
import './css/owl.theme.default.min.css';
import {encode, decode} from './commponent/utils'
import $ from "jquery";
import BigNumber from "bignumber.js";
import copy from 'copy-to-clipboard';
import seropp from "sero-pp";
import serojs from "serojs";
import language from './commponent/language'

const BN = require('bn.js');

const abiJson = [{
    "inputs": [{"internalType": "uint8", "name": "matrix", "type": "uint8"}, {
        "internalType": "uint8",
        "name": "level",
        "type": "uint8"
    }], "name": "buyNewLevel", "outputs": [], "stateMutability": "payable", "type": "function"
}, {
    "inputs": [],
    "name": "info",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}, {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
    }, {"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "isUserExists",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [{"internalType": "uint256", "name": "referrerId", "type": "uint256"}],
    "name": "registration",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
}, {
    "inputs": [],
    "name": "userInfo",
    "outputs": [{"internalType": "uint256", "name": "id", "type": "uint256"}, {
        "internalType": "uint256",
        "name": "referrer",
        "type": "uint256"
    }, {"internalType": "uint256", "name": "partnersCount", "type": "uint256"}, {
        "internalType": "uint256",
        "name": "s3Income",
        "type": "uint256"
    }, {"internalType": "uint256", "name": "s4Income", "type": "uint256"}, {
        "internalType": "bool[]",
        "name": "activeS3Levels",
        "type": "bool[]"
    }, {"internalType": "bool[]", "name": "activeS4Levels", "type": "bool[]"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [{"internalType": "uint256", "name": "id", "type": "uint256"}, {
        "internalType": "uint8",
        "name": "level",
        "type": "uint8"
    }],
    "name": "usersS3Matrix",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}, {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
    }, {"internalType": "uint8[]", "name": "", "type": "uint8[]"}, {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
    }, {"internalType": "uint256", "name": "", "type": "uint256"}, {
        "internalType": "bool",
        "name": "",
        "type": "bool"
    }, {"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [{"internalType": "uint256", "name": "id", "type": "uint256"}, {
        "internalType": "uint8",
        "name": "level",
        "type": "uint8"
    }],
    "name": "usersS4Matrix",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}, {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
    }, {"internalType": "uint8[]", "name": "", "type": "uint8[]"}, {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
    }, {"internalType": "uint8[]", "name": "", "type": "uint8[]"}, {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
    }, {"internalType": "uint256", "name": "", "type": "uint256"}, {
        "internalType": "bool",
        "name": "",
        "type": "bool"
    }, {"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
}];

const contract = serojs.callContract(abiJson, "hrdm67bnWENArcBkUnwtHj3RffmgtnHPdjQqDBrRVDJWGGAJGKCwsZ1NaEUDjatRymFhdfesZoMkdvir3Spn8Jc");
const config = {
    name: "wmhl",
    contractAddress: contract.address,
    github: "https://github.com/wmhlw/wmhl",
    author: "wmhl",
    url: document.location.href,
    logo: document.location.protocol + '//' + document.location.host + '/logo.jpeg'
};
seropp.init(config)
let levels = [0, 1, 2, 3, 4, 5];

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            accountOptions: [],
            user: {
                id: 0,
                referrer: 0,
                partnersCount: 0,
                s3Income: 0,
                s4Income: 0,
                income: 0,
                activeS3Levels: [],
                activeS4Levels: []
            },
            info: {
                total: 0,
                regNumOf24H: 0,
                lastUserId: 2
            },
            txHash: "",
            alertMsg: ""
        };
    }

    fetchInfo(mainPKr) {
        if (!mainPKr && this.state.account) {
            mainPKr = this.state.account.mainPKr;
        }
        if (!mainPKr) {
            return;
        }

        let that = this;
        that.info(mainPKr, function (info) {
            that.setState({info: info});
        })
        that.userInfo(mainPKr, function (user) {
            that.setState({user: user});
        });
    }

    componentDidMount() {
        let that = this;
        if (this.state.account) {
            this.fetchInfo(this.state.account.mainPKr);
        } else {
            seropp.init(config, function () {
                that.getCurrentAccount(function (account) {
                    that.setState({account: account});
                    that.fetchInfo(account.mainPKr);
                });
            })
        }

        this.timer = setInterval(function () {
            that.fetchInfo();
        }, 20000);
    }

    componentWillUnmount() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }

    showAccount(account) {
        if (!account) {
            return "选择账户"
        }
        return account.name + " " + account.mainPKr.slice(0, 5) + "..." + account.mainPKr.slice(-5)
    }

    showName(account) {
        if (!account) {
            return "选择账户"
        }
        if (account.name) {
            return account.name
        } else {
            return account.mainPKr.slice(0, 3) + "..." + account.mainPKr.slice(-3)
        }
    }

    showAddress(addr) {
        return addr.slice(0, 5) + "..." + addr.slice(-5)
    }

    register() {
        let that = this;
        let referrerId;
        try {
            referrerId = decode($("#referrerCode").val());
        } catch (e) {
            referrerId = this.state.info.lastUserId;
        }
        if (referrerId >= this.state.info.lastUserId) {
            $(".registerForm").attr("class", "was-validated");
            $(".feedback").attr("class", "invalid-feedback");
            $("#referrerCode").attr("class", "form-control is-invalid");
        } else {
            this.registration(this.state.account, referrerId, function (hash, err) {
                if (err) {
                    that.selfAlert(err);
                }
                $("#register").modal('hide');
            });
        }
    }

    render() {
        let that = this;

        let s3Ternarys = this.state.user.activeS3Levels.map((val, index) => {
            let status = val ? "active" : "nonactive";
            let level = index + 1;

            let buy = !val && index > 0 && that.state.user.activeS3Levels[index - 1];

            let s3 = this.state.user.s3LevelsMap[level];
            let relationships = [0, 0, 0]
            if (s3) {
                relationships = this.pushN(s3.relationships, 0, 3 - s3.relationships.length);
            }
            return (
                <div className="ternary" key={index}>
                    <a className={"ternary-root matrix-root__" + status}>
                        {
                            buy ? <i className="matrix-icon_cart matrix-icon_cart__big " data-matrix="1" data-level="4"
                                     data-matrix_price="0.2" title="Buy" onClick={() => {
                                    this.buyNewLevel(that.state.account, 1, level);
                                }
                                }></i> :
                                !val &&
                                <i className="matrix-icon_cart matrix-icon_cart__small " data-matrix="1" data-level="5"
                                   data-matrix_price="0.4" title="Buy"></i>
                        }
                        <span className="matrix-level matrix-level__active ">
                                                    <font style={{verticalAlign: 'inherit'}}><font
                                                        style={{verticalAlign: 'inherit'}}>1个 </font></font></span>
                        <span className="matrix-price">
                                                    <font style={{verticalAlign: 'inherit'}}><font
                                                        style={{verticalAlign: 'inherit'}}>{30 * Math.pow(2, index)}</font></font></span>
                        {
                            s3 && s3.blocked &&
                            <span className="level-locked"><img src={require("./img/alert.svg")}/></span>
                        }

                    </a>
                    <div className="ternary-children">
                        {
                            relationships.map((val, index) => {
                                let s = "nonactive";
                                if (val == 1) {
                                    s = "active";
                                } else if (val == 2) {
                                    s = "overflow_partner";
                                } else if (val == 3) {
                                    s = "overflow";
                                } else if (val == 4) {
                                    s = "advance";
                                }
                                return (
                                    <div key={index} className={"matrix-children__" + s}></div>
                                )
                            })
                        }
                    </div>
                    <div className="ternary-branchs">
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                    <div className="matrix-break"></div>
                    <div className="matrix-info">
                        <div className="matrix_partners__count">
                                                    <span>
                                                        <font style={{verticalAlign: 'inherit'}}><font
                                                            style={{verticalAlign: 'inherit'}}>{s3 ? s3.partnersCount : 0}</font></font>
                                                    </span>
                            <i className="matrix-icon_users"></i>
                        </div>
                        <div className="matrix_reinvest"><span>
                                                    <font style={{verticalAlign: 'inherit'}}><font
                                                        style={{verticalAlign: 'inherit'}}>{s3 ? s3.reinvestCount : 0}</font></font>
                                                </span>
                            <i className="matrix-icon_sync"></i>
                        </div>
                    </div>
                </div>
            )
        })

        let s4Ternarys = this.state.user.activeS4Levels.map((val, index) => {
            let status = val ? "active" : "nonactive";
            let level = index + 1;

            let buy = !val && index > 0 && that.state.user.activeS4Levels[index - 1];

            let s4 = this.state.user.s4LevelsMap[level];

            let firstRelationships = [0, 0];
            let secondRelationships = [0, 0, 0, 0];
            if (s4) {
                firstRelationships = this.pushN(s4.firstRelationships, 0, 2 - s4.firstRelationships.length);
                secondRelationships = this.pushN(s4.secondRelationships, 0, 4 - s4.secondRelationships.length);
            }

            return (
                <div className="binary" key={index}>
                    <a
                        className={"binary-root matrix-root__" + status}>
                        {
                            buy ? <i className="matrix-icon_cart matrix-icon_cart__big " data-matrix="1" data-level="4"
                                     data-matrix_price="0.2" title="Buy" onClick={() => {
                                    this.buyNewLevel(that.state.account, 2, level);
                                }
                                }></i> :
                                !val &&
                                <i className="matrix-icon_cart matrix-icon_cart__small " data-matrix="1" data-level="5"
                                   data-matrix_price="0.4" title="Buy"></i>
                        }
                        <span className="matrix-level matrix-level__active ">1 </span>
                        <span className="matrix-price">{30 * Math.pow(2, index)}</span>
                        {
                            s4 && s4.blocked &&
                            <span className="level-locked"><img src={require("./img/alert.svg")}/></span>
                        }
                    </a>
                    <div className="binary-children binary-children_level__1">
                        {
                            firstRelationships.map((val, index) => {
                                let s = "nonactive";
                                if (val == 1) {
                                    s = "active";
                                } else if (val == 2) {
                                    s = "overflow_partner";
                                } else if (val == 3) {
                                    s = "overflow";
                                } else if (val == 4) {
                                    s = "advance";
                                }
                                return (
                                    <div key={index} className={"matrix-children__" + s}></div>
                                )
                            })
                        }
                    </div>
                    <div className="binary-children binary-children_level__2">
                        {
                            secondRelationships.map((val, index) => {
                                let s = "nonactive";
                                if (val == 1) {
                                    s = "active";
                                } else if (val == 2) {
                                    s = "overflow_partner";
                                } else if (val == 3) {
                                    s = "overflow";
                                } else if (val == 4) {
                                    s = "advance";
                                }
                                return (
                                    <div key={index} className={"matrix-children__" + s}></div>
                                )
                            })
                        }
                    </div>
                    <div className="binary-branchs">
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                    <div className="matrix-break"></div>
                    <div className="matrix-info">
                        <div className="matrix_partners__count"><span>{s4 ? s4.partnersCount : 0}</span>
                            <i className="matrix-icon_users"></i>
                        </div>
                        <div className="matrix_reinvest"><span>{s4 ? s4.reinvestCount : 0} </span>
                            <i className="matrix-icon_sync"></i>
                        </div>
                    </div>
                </div>
            )
        })
        return (
            <div className="container">
                <div>
                    <div className="modal fade" id="rule" data-backdrop="static" data-keyboard="false"
                         tabIndex="-1" role="dialog" aria-labelledby="staticBackdropLabel" aria-hidden="true"
                    >
                        <div className="modal-dialog">
                            <div className="modal-content" style={{background: '#8c1b13', color: '#da9728'}}>
                                <div className="modal-header">
                                    <h5 className="modal-title" id="staticBackdropLabel">{language.get("rule")}</h5>

                                </div>
                                <div className="modal-body">
                                    <div>
                                        全球共享矩阵SERO营销计划。<br/> wmhl寄生在SERO匿名公链上永续存在！
                                    </div>
                                    <br/>
                                    <div>玩家参与条件与级别:</div>
                                    <div>营销矩阵分为S3矩阵和S6矩阵，分别为12个级别。</div>
                                    <div>
                                        <div>S3矩阵</div>
                                        <table border="1"
                                               style={{borderColor: 'white', textAlign: 'center', width: '100%'}}>
                                            <tr>
                                                {
                                                    levels.map(function (val, index) {
                                                            return (
                                                                <td>{30 * Math.pow(2, index)}</td>
                                                            )
                                                        }
                                                    )
                                                }
                                            </tr>
                                            <tr>
                                                {
                                                    levels.map(function (val, index) {
                                                            return (
                                                                <td>{1920 * Math.pow(2, index)}</td>
                                                            )
                                                        }
                                                    )
                                                }
                                            </tr>
                                        </table>
                                        <div>S6矩阵</div>
                                        <table border="1"
                                               style={{borderColor: 'white', textAlign: 'center', width: '100%'}}>
                                            <tr>
                                                {
                                                    levels.map(function (val, index) {
                                                            return (
                                                                <td>{30 * Math.pow(2, index)}</td>
                                                            )
                                                        }
                                                    )
                                                }
                                            </tr>
                                            <tr>
                                                {
                                                    levels.map(function (val, index) {
                                                            return (
                                                                <td>{1920 * Math.pow(2, index)}</td>
                                                            )
                                                        }
                                                    )
                                                }
                                            </tr>
                                        </table>
                                    </div>
                                    <br/>
                                    <div>
                                        首次入金系统默认同时把S3矩阵和S6矩阵的第一个级别激活。升级第二个级别S3和S6矩阵可以单独升级。每一次升级的成本是前一个级别的两倍，但推荐收益也同步提高。每升级激活一个级别，前面所有激活的级别都可以享受永续循环收益。
                                    </div>
                                    <br/>
                                    <div>玩法及收益:</div>
                                    <div>
                                        S3矩阵的合约规则:共有3个空位，前面2个空位投资额100%到您个人钱包，第3个空位投资额滑至上级6代，平均分发到个人钱包。一轮后系统默认提示升级下一个级别，升级好下个级别，前面已激活的级别均可循环重置永续收益。
                                    </div>
                                    <div>
                                        S6矩阵的合约规则:共有6个空位，第一层2个空位投资额100%滑至上级，第二层4个空位，前面3个空位投资额100%给到您个人钱包，最后一个空位投资额滑至上级6代，平均分发到个人钱包。一轮后系统默认提示升级下一个级别，升级好下个级别，前面已激活的级别均可循环重置永续收益。
                                    </div>
                                    <br/>
                                    <div>烧伤机制:</div>
                                    <div>
                                        直推会员在S3矩阵，S6矩阵升级激活的级别如果大于自己的级别则会有烧伤，烧伤奖金100%收益系统会自动滑至上级同级别。
                                    </div>
                                    <div>
                                        系统代码100%开源，奖金收益100%拔比，无资金沉淀，链上秒结算，收益自动到账您个人钱包，0泡沫，永不崩盘，永不关网，永不跑路，无人为操控，一次性投资，终身收益。
                                    </div>
                                    <div>技术占股6%。</div>
                                    <div>系统默认邀请码: <a onClick={() => {
                                        if (copy("rja6x7")) {
                                            this.selfAlert(language.get("success"));
                                        }
                                    }}>rja6x7</a></div>
                                    <div>
                                        开源代码查询地址1: <br/>https://github.com/wmhlw/wmhl
                                    </div>
                                    <div>开源代码查询地址2: <br/>https://gitee.com/wmhl/wmhl</div>

                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary"
                                            data-dismiss="modal">{language.get("close")}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal fade" id="alert" tabIndex="-1" role="dialog"
                         aria-labelledby="exampleModalLabel" aria-hidden="true">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div id="alertMsg" style={{color: 'black', textAlign: 'center'}}></div>
                            </div>
                        </div>
                    </div>
                    <div className="modal fade" id="accounts" tabIndex="-1" role="dialog"
                         aria-labelledby="exampleModalLabel" aria-hidden="true">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="list-group">
                                    {this.state.accountOptions}
                                </div>
                            </div>

                        </div>
                    </div>

                    <div className="modal fade" id="register" tabIndex="-1" role="dialog"
                         aria-labelledby="exampleModalLabel" aria-hidden="true">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="exampleModalLabel"
                                        style={{color: 'black'}}>{language.get("register")}</h5>
                                </div>
                                <div className="modal-body">
                                    <form id="registerForm">
                                        <div>
                                            <label htmlFor="recipient-name" className="col-form-label"
                                                   style={{color: 'black'}}>{language.get("code")}:</label>
                                            <input type="text" className="form-control" id="referrerCode"
                                                   onChange={(e) => {

                                                   }}/>
                                            <div className="feedback">
                                                The code is error!
                                            </div>
                                        </div>
                                    </form>

                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary"
                                            data-dismiss="modal">{language.get("close")}</button>
                                    <button type="button" className="btn btn-primary" onClick={() => {
                                        this.register();
                                    }}>{language.get("ok")}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row logotype-wrapper">
                    <div style={{width: '100%', textAlign: 'right', paddingTop: '20px', paddingRight: '20px'}}>
                        <a onClick={() => {
                            $("#rule").modal('show');
                        }}>{language.get("rule")}</a></div>

                </div>
                <div className="row">
                    <div className="col-lg-3 mb-4">
                        <div className="border-gradient section-left">
                            <div className="border-gradient_content status-panel">
                                <div className="status-panel_id">
                                    <div className="row">
                                        <div className="col-8" style={{textAlign: 'left'}}>
                                            <a onClick={() => {
                                                this.getAccountList(function (accounts) {
                                                    let options = [];
                                                    accounts.forEach((item, index) => {
                                                        options.push(<button type="button"
                                                                             className="list-group-item list-group-item-action"
                                                                             onClick={() => {
                                                                                 that.setState({account: item});
                                                                                 $('#accounts').modal('hide')
                                                                                 that.fetchInfo(item.mainPKr);
                                                                             }}>
                                                            {that.showAccount(item)}
                                                        </button>)
                                                    });

                                                    that.setState({accountOptions: options})
                                                    $('#accounts').modal('show')
                                                });
                                            }}>{this.showName(this.state.account)}</a>
                                        </div>
                                        <div className="col-4" style={{textAlign: 'right'}}>
                                            {
                                                this.state.user.id == 0 && <a onClick={() => {
                                                    $(".registerForm").attr("class", "was-validated");
                                                    $(".feedback").attr("class", "");
                                                    $("#referrerCode").attr("class", "form-control");
                                                    $('#register').modal('show')
                                                }
                                                }>{language.get("register")}</a>
                                                // <a style={{color: '#EEE'}} className="status-panel__user-id"
                                                //    data-trigger_value_siblings=".trigger_value__user-id"
                                                //    data-trigger_value="***|878430"><font
                                                //     style={{verticalAlign: 'inherit'}}><font
                                                //     style={{verticalAlign: 'inherit'}}>
                                                //     ID </font></font><span title="隐藏/显示"><font
                                                //     style={{verticalAlign: 'inherit'}}><font
                                                //     style={{verticalAlign: 'inherit'}}>{this.state.user.id}</font></font></span>
                                                // </a>
                                            }
                                            <div className="status-panel_partners__top">
                                                <span>{this.state.user.partnersCount}</span>
                                                <img src={require('./img/partners_light.svg')} alt=""/>
                                            </div>
                                        </div>
                                    </div>


                                </div>

                                <div className="status-panel_money">
                                    <div className="status-panel_money_total__dollars">
                                    </div>
                                    <div className="status-panel_money_total__eth" title="(0)">
                                        {new BigNumber(this.state.user.s3Income + this.state.user.s4Income).toFixed(3)} SERO
                                    </div>
                                </div>
                                <div className="status-panel_money">
                                    <div className="border-gradient">
                                        <div className="border-gradient_content">
                                            <div className="logotypeX3" style={{fontSize: '1.7rem', fontWeight: '600'}}>
                                                S3
                                            </div>
                                            <div className="status-panel_money__dollars">

                                            </div>
                                            <div className="status-panel_money__eth" title="(0)">
                                                {this.state.user.s3Income} SERO
                                            </div>
                                        </div>
                                    </div>
                                    <div className="border-gradient">
                                        <div className="border-gradient_content">
                                            <div className="logotypeX4" style={{fontSize: '1.7rem', fontWeight: '600'}}>
                                                S6
                                            </div>
                                            <div className="status-panel_money__dollars">

                                            </div>
                                            <div className="status-panel_money__eth" title="(0)">
                                                {this.state.user.s4Income} SERO
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="section-right">
                            <div className="border-gradient">
                                <div className="border-gradient_content status-panel_partners pb-5">
                                    <div className="status-panel_partners__subject">
                                        {language.get("code")}
                                        <div className="status-panel_partners__count">
                                        </div>
                                    </div>
                                    <div
                                        className="status-panel_wallets__subject">
                                        {this.state.user.id > 0 && encode(this.state.user.id)}
                                    </div>
                                    <div className="status-panel_wallets__btn" style={{right: '6px'}}
                                         onClick={() => {
                                             if (this.state.user.id > 0 && copy(encode(this.state.user.id))) {
                                                 this.selfAlert(language.get("success"));
                                             }
                                         }}>
                                        Copy
                                    </div>
                                </div>
                            </div>
                            <div className="border-gradient mt-5">
                                <div className="border-gradient_content status-panel_wallets pb-4">
                                    <div className="status-panel_wallets__subject">
                                        {language.get("wallet")}
                                    </div>
                                    <div className="status-panel_wallets__subject"
                                         style={{wordBreak: 'break-word'}}>
                                        {this.state.account && this.showAddress(this.state.account.mainPKr)}
                                    </div>
                                    <div className="status-panel_wallets__btn" style={{right: '6px'}}
                                         onClick={() => {
                                             if (copy(this.state.account.mainPKr)) {
                                                 this.selfAlert(language.get("success"));
                                             }
                                         }}>
                                        Copy
                                    </div>
                                </div>
                            </div>
                            <div className="border-gradient mt-5">
                                <div className="border-gradient_content status-panel_wallets pb-4">
                                    <div className="status-panel_wallets__subject">
                                        {language.get("contract")}
                                    </div>
                                    <div className="status-panel_wallet"
                                         style={{wordBreak: 'break-word'}}>
                                        {this.showAddress(contract.address)}
                                    </div>
                                    <div className="status-panel_wallets__btn" style={{right: '6px'}}
                                         onClick={() => {
                                             if (copy(contract.address)) {
                                                 this.selfAlert(language.get("success"));
                                             }
                                         }}>
                                        Copy
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-9">
                        <div className="row">
                            <div className="col">
                                <div className="border-gradient">
                                    <div className="border-gradient_content">
                                        <div id="x3main"
                                             style={{fontSize: '1.7rem', fontWeight: '600', textAlign: "center"}}>
                                            S3
                                        </div>
                                        <div className="ternary-wrapper">
                                            {s3Ternarys}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row mt-2 mb-5">
                            <div className="col">
                                <div className="icon-tips">
                                    <div className="matrix_reinvest">
                                        <i className="matrix-icon_sync"></i> <span>{language.get("reopens")}</span>
                                    </div>
                                    <div className="matrix_partners__count">
                                        <i className="matrix-icon_users"></i> <span>{language.get("partners")}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col">
                                <div className="border-gradient">
                                    <div className="border-gradient_content">
                                        <div id="x4main"
                                             style={{fontSize: '1.7rem', fontWeight: '600', textAlign: "center"}}>
                                            S6
                                        </div>
                                        <div className="binary-wrapper">
                                            {s4Ternarys}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row icon-tips text-left mt-3">
                            <div className="col-md-5">
                                <div>
                                    <i className="matrix-single matrix-children__active"></i>
                                    <span className="icon-tips_text">{language.get("partner1")}</span>
                                </div>
                                {/*<div>*/}
                                {/*    <i className="matrix-single matrix-children__overflow"></i>*/}
                                {/*    <span className="icon-tips_text">{language.get("partner2")}</span>*/}
                                {/*</div>*/}
                            </div>
                            <div className="col-md-6">
                                <div>
                                    <i className="matrix-single matrix-children__overflow_partner"></i>
                                    <span className="icon-tips_text">{language.get("partner3")}</span>
                                </div>
                                <div>
                                    <i className="matrix-single matrix-children__advance"></i>
                                    <span className="icon-tips_text">{language.get("partner4")}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    selfAlert(msg) {
        $("#alertMsg").html(msg);
        $("#alert").modal('show');

        setTimeout(function () {
            $("#alert").modal('hide');
            $("#alertMsg").html("");
        }, 1000);
    }

    pushN(arr, val, n) {
        for (var i = 0; i < n; i++) {
            arr.push(val);
        }
        return arr;
    }

    info(mainPKr, callback) {
        this.callMethod('info', mainPKr, [], function (ret) {
            callback(
                {
                    total: ret[0] / 1e18,
                    regNumOf24H: ret[1],
                    lastUserId: ret[2]
                }
            );
        });
    }

    isUserExists(mainPKr, id, callback) {
        this.callMethod('isUserExists', mainPKr, [id], function (ret) {
            callback(ret);
        });
    }

    userInfo(mainPKr, callback) {
        let that = this;
        this.callMethod('userInfo', mainPKr, [], function (ret) {
            let id = ret[0].toNumber();
            let list = [];
            let s3LevelsMap = new Map();
            let s4LevelsMap = new Map();
            let activeS3Levels = ret[5];
            let activeS4Levels = ret[6];
            for (var i = 0; i < 12; i++) {
                if (activeS3Levels[i]) {
                    list.push({matrix: 1, level: i + 1});
                }
                if (activeS4Levels[i]) {
                    list.push({matrix: 2, level: i + 1});
                }
            }
            if (list.length == 0) {
                callback({
                    id: id,
                    referrer: ret[1].toNumber(),
                    partnersCount: ret[2].toNumber(),
                    s3Income: new BigNumber(ret[3]).div(1e18).toNumber(),
                    s4Income: new BigNumber(ret[4]).div(1e18).toNumber(),
                    activeS3Levels: activeS3Levels,
                    s3LevelsMap: s3LevelsMap,
                    activeS4Levels: activeS4Levels,
                    s4LevelsMap: s4LevelsMap
                });
            } else {
                let executing = [];
                let len = 0;

                function toFetch() {
                    if (len === list.length) {
                        return Promise.resolve();
                    }

                    let one = new Promise(function (resolve, reject) {
                        let fetch = list[len++];
                        if (fetch.matrix == 1) {
                            that.usersS3Matrix(mainPKr, id, fetch.level, function (ret) {
                                s3LevelsMap[fetch.level] = {
                                    currentReferrer: ret[0],
                                    referrals: ret[1],
                                    relationships: ret[2],
                                    reinvestCount: ret[3].toNumber(),
                                    partnersCount: ret[4].toNumber(),
                                    blocked: ret[5],
                                    isExtraDividends: ret[6],
                                }
                                resolve(ret);
                            });
                        } else {
                            that.usersS4Matrix(mainPKr, id, fetch.level, function (ret) {
                                s4LevelsMap[fetch.level] = {
                                    currentReferrer: ret[0],
                                    firstLevelReferrals: ret[1],
                                    firstRelationships: ret[2],
                                    secondLevelReferrals: ret[3],
                                    secondRelationships: ret[4],
                                    reinvestCount: ret[5].toNumber(),
                                    partnersCount: ret[6].toNumber(),
                                    blocked: ret[7],
                                    isExtraDividends: ret[8],
                                }
                                resolve(ret);
                            });
                        }
                    }).then((ret) => {
                        executing.splice(executing.indexOf(one), 1)
                    });
                    executing.push(one);

                    let p = Promise.resolve();
                    if (executing.length >= 10) {
                        p = Promise.race(executing);
                    }
                    return p.then(() => toFetch());
                }

                toFetch().then(() => Promise.all(executing)).then(() => {
                    callback({
                        id: id,
                        referrer: ret[1].toNumber(),
                        partnersCount: ret[2].toNumber(),
                        s3Income: new BigNumber(ret[3]).div(1e18).toNumber(),
                        s4Income: new BigNumber(ret[4]).div(1e18).toNumber(),
                        income: new BigNumber(ret[3] + ret[4]).div(1e18).toNumber(),
                        activeS3Levels: activeS3Levels,
                        s3LevelsMap: s3LevelsMap,
                        activeS4Levels: activeS4Levels,
                        s4LevelsMap: s4LevelsMap
                    });
                })
            }
        });
    }

    usersS3Matrix(mainPKr, id, level, callback) {
        let that = this;
        this.callMethod('usersS3Matrix', mainPKr, [id, level], function (ret) {
            callback(ret);
        });
    }

    usersS4Matrix(mainPKr, id, level, callback) {
        this.callMethod('usersS4Matrix', mainPKr, [id, level], function (ret) {
            callback(ret);
        });
    }

    registration(account, referrerId, callback) {
        this.executeMethod('registration', account.pk, account.mainPKr, [referrerId], 60 * 1e18, callback);
    }

    buyNewLevel(account, matrix, level, callback) {
        let value = 30 * Math.pow(2, level - 1) * 1e18;
        console.log("buyNewLevel", matrix, level);
        this.executeMethod('buyNewLevel', account.pk, account.mainPKr, [matrix, level], value, callback);
    }

    callMethod(_method, from, _args, callback) {
        let that = this;
        let packData = this.contract.packData(_method, _args, true);
        let callParams = {
            from: from,
            to: this.contract.address,
            data: packData
        };

        seropp.call(callParams, function (callData) {
            console.log(_method, callData);
            if (callData !== "0x") {
                let res = that.contract.unPackDataEx(_method, callData);
                if (callback) {
                    callback(res);
                }
            } else {
                callback("0x0");
            }
        });
    }

    executeMethod(_method, pk, mainPKr, args, value, callback) {
        let that = this;

        let packData = "0x";
        if ("" !== _method) {
            packData = contract.packData(_method, args, true);
        }

        let executeData = {
            from: pk,
            to: contract.address,
            value: "0x" + value.toString(16),
            data: packData,
            gasPrice: "0x" + new BigNumber(1000000000).toString(16),
            cy: "SERO",
        };
        let estimateParam = {
            from: mainPKr,
            to: contract.address,
            value: "0x" + value.toString(16),
            data: packData,
            gasPrice: "0x" + new BigNumber(1000000000).toString(16),
            cy: "SERO",
        };

        seropp.estimateGas(estimateParam, function (gas, error) {
            if (error) {
                if (callback) {
                    callback(null, error)
                }
            } else {
                executeData["gas"] = gas;
                seropp.executeContract(executeData, function (res, error) {
                    if (callback) {
                        callback(res, error)
                    }
                })
            }
        });
    }

    callMethod(_method, from, _args, callback) {
        let that = this;
        let packData = contract.packData(_method, _args, true);
        let callParams = {
            from: from,
            to: contract.address,
            data: packData
        };

        seropp.call(callParams, function (callData) {
            if (callData !== "0x") {
                let res = contract.unPackData(_method, callData);
                if (callback) {
                    callback(res);
                }
            } else {
                callback("0x0");
            }
        });
    }

    executeMethod(_method, pk, mainPKr, args, value, callback) {
        let that = this;

        let packData = "0x";
        if ("" !== _method) {
            packData = contract.packData(_method, args, true);
        }

        let executeData = {
            from: pk,
            to: contract.address,
            value: "0x" + value.toString(16),
            data: packData,
            gasPrice: "0x" + new BigNumber(1000000000).toString(16),
            cy: "SERO",
        };
        let estimateParam = {
            from: mainPKr,
            to: contract.address,
            value: "0x" + value.toString(16),
            data: packData,
            gasPrice: "0x" + new BigNumber(1000000000).toString(16),
            cy: "SERO",
        };

        seropp.estimateGas(estimateParam, function (gas, error) {
            if (error) {
                if (callback) {
                    callback(null, error)
                }
            } else {
                executeData["gas"] = gas;
                seropp.executeContract(executeData, function (res, error) {
                    if (callback) {
                        callback(res, error)
                    }
                })
            }
        });
    }

    getCurrentAccount(callback) {
        console.log("getCurrentAccount");
        seropp.getAccountList(function (datas) {
            let account;
            console.log("account", datas);
            for (var i = 0; i < datas.length; i++) {
                console.log("account", datas[i].IsCurrent);
                if (datas[i].IsCurrent == undefined || datas[i].IsCurrent) {
                    callback({
                        pk: datas[i].PK,
                        mainPKr: datas[i].MainPKr,
                        name: datas[i].Name,
                    });
                    break;
                }
            }
        });
    }

    getAccountList(callback) {
        seropp.getAccountList(function (datas) {
            let accounts = [];
            datas.forEach(function (item, index) {
                accounts.push({
                    pk: item.PK,
                    mainPKr: item.MainPKr,
                    name: item.Name,
                })
            });
            callback(accounts)
        });
    }

    getAccountDetails(pk, callback) {
        if (!pk) {
            return;
        }
        let self = this;
        seropp.getAccountDetail(pk, function (item) {
            callback({pk: item.PK, mainPKr: item.MainPKr, name: item.Name, balance: item.Balance["SERO"]})
        });
    }
}

export default App;
