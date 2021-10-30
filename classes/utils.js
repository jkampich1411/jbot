module.exports.MESSAGE = (msg) => console.log(msg);

function run() {
    regUserMap();
} 

/* utilsBotSupport */
var regUserMap = () => {
    class UserMap {
        constructor(uname,id) {
            this.uname = uname;
            this.id = id;
        }
    
        static get(uname, id) {
            var retMap = new Map();
    
            var voiceChannel = `svc${uname}${id}`;
    
            retMap.set('username', uname);
            retMap.set('id', id);
            retMap.set('vcn', voiceChannel);
    
            return retMap;
        };
    };

    module.exports.UserMap = UserMap;
}

run();