// Sub-Store 终极清洗、高延迟拦截与规范重命名脚本
let list = [];

// 1. 安全获取节点数据
try {
    if (typeof $nodes !== 'undefined' && Array.isArray($nodes)) {
        list = $nodes;
    } else if (typeof proxies !== 'undefined' && Array.isArray(proxies)) {
        list = proxies;
    } else if (typeof $in !== 'undefined') {
        if (Array.isArray($in)) {
            list = $in;
        } else if ($in.proxies && Array.isArray($in.proxies)) {
            list = $in.proxies;
        } else if ($in.nodes && Array.isArray($in.nodes)) {
            list = $in.nodes;
        }
    }
} catch (e) {
    list = [];
}

if (!Array.isArray(list) || list.length === 0) {
    return typeof $nodes !== 'undefined' ? $nodes : (typeof proxies !== 'undefined' ? proxies : []);
}

// ==================== 第一部分：垃圾、死节点与高延迟（>400ms）过滤 ====================
const excludeNameRegex = /(到期|剩余|流量|官网|网址|联系|发布页|客服|重置|过期|测速|群|Telegram|TG|VIP|电报|更新|日期|免费VPN|free-nodes)/i;
const excludeErrorRegex = /(timeout|error|403|forbidden|blocked|1016|failed|refused|unreachable|0ms|nan|offline|down)/i;
const excludeReturnRegex = /(回国|大陆专用|解锁CN|学术|教育网)/i;

let filtered = list.filter(node => {
    if (!node || !node.name) return false;

    const name = String(node.name).trim();
    const server = String(node.server || '').trim();

    // 1. IPv6 过滤
    if (server.includes('[') || (server.match(/:/g) || []).length >= 2 || /ipv6/i.test(name)) {
        return false;
    }

    // 2. 广告、错误、回国关键词过滤
    if (excludeNameRegex.test(name) || excludeErrorRegex.test(name) || excludeReturnRegex.test(name)) {
        return false;
    }

    // 3. 服务器地址异常拦截
    if (!server || server === '127.0.0.1' || server === 'localhost' || server.includes('0.0.0.0')) {
        return false;
    }

    // 4. 端口异常拦截
    if (node.port && (Number(node.port) <= 0 || Number(node.port) > 65535)) {
        return false;
    }

    // ==================== 【新增核心：延迟与超时过滤】 ====================
    // 检查节点自身携带的延迟属性（Sub-Store 测速后通常会带 history.delay 或 delay 字段）
    let currentDelay = null;
    if (node.history && typeof node.history.delay === 'number') {
        currentDelay = node.history.delay;
    } else if (typeof node.delay === 'number') {
        currentDelay = node.delay;
    }

    // 如果节点带有延迟数据，且延迟大于 400ms，直接过滤掉！
    if (currentDelay !== null && currentDelay > 400) {
        return false;
    }

    // 如果节点明确标记了超时或延迟为 0（代表死节点），也可以在这里拦截
    // (部分客户端测速无响应时，delay 会表现为 0 或极大值)
    if (currentDelay === 0) {
        return false;
    }

    return true;
});


// ==================== 第二部分：剥离旧编号、城市映射与规范重命名 ====================
const addflag = true;                   // 开启加国旗
const FGF = " ";                        // 国旗与名字之间的空格
const maxCount = 45;                    // 最大输出数量限制

const FG = ['🇭🇰','🇲🇴','🇹🇼','🇯🇵','🇰🇷','🇸🇬','🇺🇸','🇬🇧','🇫🇷','🇩🇪','🇦🇺','🇦🇪','🇦🇫','🇦🇱','🇩🇿','🇦🇴','🇦🇷','🇦🇲','🇦🇹','🇦🇿','🇧🇭','🇧🇩','🇧🇾','🇧🇪','🇧🇿','🇧🇯','🇧🇹','🇧🇴','🇧🇦','🇧🇼','🇧🇷','🇻🇬','🇧🇳','🇧🇬','🇧🇫','🇧🇮','🇰🇭','🇨🇲','🇨🇦','🇨🇻','🇰🇾','🇨🇫','🇹🇩','🇨🇱','🇨🇴','🇰🇲','🇨🇬','🇨🇩','🇨🇷','🇭🇷','🇨🇾','🇨🇿','🇩🇰','🇩🇯','🇩🇴','🇪🇨','🇪🇬','🇸🇻','🇬🇶','🇪🇷','🇪🇪','🇪🇹','🇫🇯','🇫🇮','🇬🇦','🇬🇲','🇬🇪','🇬🇭','🇬🇷','🇬🇱','🇬🇹','🇬🇳','🇬🇾','🇭🇹','🇭🇳','🇭🇺','🇮🇸','🇮🇳','🇮🇩','🇮🇷','🇮🇶','🇮🇪','🇮🇲','🇮🇱','🇮🇹','🇨🇮','🇯🇲','🇯🇴','🇰🇿','🇰🇪','🇰🇼','🇰🇬','🇱🇦','🇱🇻','🇱🇧','🇱🇸','🇱🇷','🇱🇾','🇱🇹','🇱🇺','🇲🇰','🇲🇬','🇲🇼','🇲🇾','🇲🇻','🇲🇱','🇲🇹','🇲🇷','🇲🇺','🇲🇽','🇲🇩','🇲🇨','🇲🇳','🇲🇪','🇲🇦','🇲🇿','🇲🇲','🇳🇦','🇳🇵','🇳🇱','🇳🇿','🇳🇮','🇳🇪','🇳🇬','🇰🇵','🇳🇴','🇴🇲','🇵🇰','🇵🇦','🇵🇾','🇵🇪','🇵🇭','🇵🇹','🇵🇷','🇶🇦','🇷🇴','🇷🇺','🇷🇼','🇸🇲','🇸🇦','🇸🇳','🇷🇸','🇸🇱','🇸🇰','🇸🇮','🇸🇴','🇿🇦','🇪🇸','🇱🇰','🇸🇩','🇸🇷','🇸🇿','🇸🇪','🇨🇭','🇸🇾','🇹🇯','🇹🇿','🇹🇭','🇹🇬','🇹🇴','🇹🇹','🇹🇳','🇹🇷','🇹🇲','🇻🇮','🇺🇬','🇺🇦','🇺🇾','🇺🇿','🇻🇪','🇻🇳','🇾🇪','🇿🇲','🇿🇼','🇦🇩','🇷🇪','🇵🇱','🇬🇺','🇻🇦','🇱🇮','CW','🇸🇨','🇦🇶','🇬🇮','🇨🇺','🇫🇴','🇦🇽','BM','TL'];
const ZH = ['香港','澳门','台湾','日本','韩国','新加坡','美国','英国','法国','德国','澳大利亚','阿联酋','阿富汗','阿尔巴尼亚','阿尔及利亚','安哥拉','阿根廷','亚美尼亚','奥地利','阿塞拜疆','巴林','孟加拉国','白俄罗斯','比利时','伯利兹','贝宁','不丹','玻利维亚','波斯尼亚和黑塞哥维那','博茨瓦纳','巴西','英属维京群岛','文莱','保加利亚','布基纳法索','布隆迪','柬埔寨','喀麦隆','加拿大','佛得角','开曼群岛','中非共和国','乍得','智利','哥伦比亚','科摩罗','刚果(布)','刚果(金)','哥斯达黎加','克罗地亚','塞浦路斯','捷克','丹麦','吉布提','多米尼加共和国','厄瓜多尔','埃及','萨尔瓦多','赤道几内亚','厄立特里亚','爱沙尼亚','埃塞俄比亚','斐济','芬兰','加蓬','冈比亚','格鲁吉亚','加纳','希腊','格陵兰','危地马拉','几内亚','圭亚那','海地','洪都拉斯','匈牙利','冰岛','印度','印尼','伊朗','伊拉克','爱尔兰','马恩岛','以色列','意大利','科特迪瓦','牙买加','约旦','哈萨克斯坦','肯尼亚','科威特','吉尔吉斯斯坦','老挝','拉脱维亚','黎巴嫩','莱索托','利比里亚','利比亚','立陶宛','卢森堡','马其顿','马达加斯加','马拉维','马来','马尔代夫','马里','马耳他','毛利塔尼亚','毛里求斯','墨西哥','摩尔多瓦','摩纳哥','蒙古','黑山共和国','摩洛哥','莫桑比克','缅甸','纳米比亚','尼泊尔','荷兰','新西兰','尼加拉瓜','尼日尔','尼日利亚','朝鲜','挪威','阿曼','巴基斯坦','巴拿马','巴拉圭','秘鲁','菲律宾','葡萄牙','波多黎各','卡塔尔','罗马尼亚','俄罗斯','卢旺达','圣马力诺','沙特阿拉伯','塞内加尔','塞尔维亚','塞拉利昂','斯洛伐克','斯洛文尼亚','索马里','南非','西班牙','斯里兰卡','苏丹','苏里南','-','瑞典','瑞士','叙利亚','塔吉克斯坦','坦桑尼亚','泰国','多哥','汤加','特立尼达和多巴哥','突尼斯','土耳其','土库曼斯坦','美属维尔京群岛','乌干达','乌克兰','乌拉圭','乌兹别克斯坦','委内瑞拉','越南','也门','赞比亚','津巴布韦','Andorra','Reunion','Poland','Guam','Vatican','Liechtensteins','Curacao','Seychelles','Antarctica','Gibraltar','Cuba','Faroe Islands','Ahvenanmaa','Bermuda','Timor-Leste'];

const cityToCountry = {
    "洛杉矶": "美国", "芝加哥": "美国", "休斯敦": "美国", "纽约": "美国", "硅谷": "美国", "圣何塞": "美国",
    "新泽西": "美国", "拉斯维加斯": "美国", "德州": "美国",
    "法兰克福": "德国", "东京": "日本", "大阪": "日本", "伦敦": "英国", "巴黎": "法国", "首尔": "韩国"
};

const retainKeywords = ["原生", "GPT", "NF", "IPLC", "IEPL"];

filtered.forEach((e) => {
    let rawName = e.name || "";
    
    let cleanName = rawName.replace(/[\uD83C[\uDDE0-\uDDFF]\uD83C[\uDDE0-\uDDFF]/g, "")
                          .replace(/\s*\(\d+\)/g, "")
                          .replace(/\s*\d+$/, "")
                          .replace(/^[\s_\-\|\.:]+|[\s_\-\|\.:]+$|(?<=\s)[\s_\-\|\.:]+|[\s_\-\|\.:]+(?=\s)/g, "")
                          .trim();

    let matchedCountry = "";
    for (let zhKey of ZH) {
        if (zhKey !== "-" && cleanName.includes(zhKey)) {
            matchedCountry = zhKey;
            break;
        }
    }

    if (!matchedCountry) {
        for (let city in cityToCountry) {
            if (cleanName.includes(city)) {
                matchedCountry = cityToCountry[city];
                break;
            }
        }
    }

    let foundTags = [];
    retainKeywords.forEach(tag => {
        if (new RegExp(tag, 'i').test(cleanName)) {
            foundTags.push(tag);
        }
    });
    if (/IPLC/i.test(cleanName) && !foundTags.includes("IPLC")) {
        foundTags.push("IPLC");
    }

    if (matchedCountry) {
        let flag = "";
        if (addflag) {
            let index = ZH.indexOf(matchedCountry);
            if (index !== -1) {
                flag = FG[index] === "🇹🇼" ? "🇨🇳" : FG[index];
            }
        }
        let parts = [flag, matchedCountry, ...foundTags].filter(Boolean);
        e.name = parts.join(FGF);
    } else {
        e.name = cleanName || rawName;
    }
});


// ==================== 第三部分：统一整洁编号与数量限制 ====================
const nameCountMap = {};
filtered.forEach((e) => {
    if (!nameCountMap[e.name]) {
        nameCountMap[e.name] = 1;
    } else {
        nameCountMap[e.name]++;
    }
    let seq = String(nameCountMap[e.name]).padStart(2, "0");
    e.name = `${e.name} (${seq})`;
});

const finalResult = filtered.slice(0, maxCount);

return finalResult.length > 0 ? finalResult : list;
