/**
 * Created by Dima on 01.11.2019.
 */
let str = 'skdmdf, dfbdfb!sbdfbd  dfbdf.';
str = Array.from(str);
let str1 = [];
let tmp_i=0;
//let tmp_i = 0;
for (let i = 0; i<str.length;i++){
    if (str[i].charCodeAt(0)>32 && str[i].charCodeAt(0)<65){
        if (i !== str.length-1 && str[i+1].charCodeAt(0)!==32){
        str1[tmp_i] = str[i];
        str1[tmp_i+1]=' ';
        tmp_i+=2;}
        else
            str1[tmp_i] = str[i];
    }else{
    if(str[i].charCodeAt(0)===32 && str[i+1].charCodeAt(0)===32) {
       //tmp_i++;
       //i--;

    }else{
       str1[tmp_i]=str[i];
       tmp_i++;
    }
    }
}
console.log(str1);