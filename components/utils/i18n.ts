import { extend } from 'lodash';

class i18n {
    private language: string;
    private i18nMap: any;

    public constructor() {
        this.language = 'zh';
        this.i18nMap = {};
    }

    /**
     * 切换语言
     * 
     * @param language 语言 zh | en | tw
     */
    public switch(language: string) {
        this.language = language;
    }

    /**
     * 
     * 注册语言包
     * 
     * @param language 语言
     * @param langMap 语言map
     */
    public register(language: string, langPackage: any) {
        if (!this.i18nMap[language]) {
            this.i18nMap[language] = {};
        }

        extend (this.i18nMap[language], langPackage)
    }


    /**
     * 翻译单词
     * @param word 单词
     * @returns 
     */
    public translate(word: string): string {
        let language: any = this.i18nMap[this.language];

        return language[word] || word;
    }
}

export default new i18n();