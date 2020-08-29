import intl from 'react-intl-universal';
import seropp from "sero-pp";
// common locale data
// require('intl/locale-data/jsonp/en.js');
// require('intl/locale-data/jsonp/zh.js');

// app locale data
const locales = {
    "en_US": require('./locales/en-US.json'),
    "zh_CN": require('./locales/zh-CN.json'),
};

class Language {

    constructor() {
        this.loadLocales();
    }

    loadLocales() {
        let that = this;

        seropp.getInfo(function (info) {
            console.log("lang", info.language, typeof info.language, info.language == "zh_CN");
            let locale = info.language;
            intl.init({
                currentLocale: info.language,
                locales,
            }).then(function () {
                that.init = true;
            })
        })

    }

    get(name) {
        return intl.get(name);
    }
}

const language = new Language();
export default language;




