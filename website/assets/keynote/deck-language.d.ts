export function createDeckTranslator(strings:Record<string,string>):(value:string,language?:string)=>string;
export function installDeckLanguage(options:{catalogue:any;reference:any}):{choose(language:string):void;readonly language:string};
