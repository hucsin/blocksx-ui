import Words from './word';
export default class ValidMessage {
    private static InvalidResponse: string []  = [
        "Please increase the word count to help me understand better.",
        "Could you describe your needs in more detail?",
        "Please try to ask your question in complete sentences.",
        "I need more information to assist you.",
        "Please provide specific actions or requests.",
        "Your input is not clear enough; please rephrase.",
        "Please express your question in more words.",
        "Your description is too short; please elaborate.",
        "Please provide more information."
    ]
    /**
     * 有效提问
     * 单词数量必须大于等于2
     * 
     * 有效果单词必须在4个以上，
     * 如果只有2个或则3个单词，需要必须有一个单词在Words中
     * @param message 
     * @returns 
     */
    public static isValidQuestion(message: string): boolean {
        let messageWords = message.toLowerCase().split(' ');
        if (messageWords.length < 2) {
            return false;
        }
        if (messageWords.length < 4) {
            return messageWords.some(word => Words.includes(word));
        }

        return true;
    }
    /**
     * 获取无效响应
     * @returns 
     */
    public static getInvalidResponse() {
        let randomIndex = Math.floor(Math.random() * this.InvalidResponse.length);
        return this.InvalidResponse[randomIndex];
    }
}