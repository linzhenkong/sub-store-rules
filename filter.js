// Sub-Store 终极智能清洗、过滤、城市映射与重命名脚本
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
    return typeof $nodes !== 'undefined' ?$nodes : (typeof proxies !== 'undefined' ? proxies : []);
}

// ==================== 第一部分：高强度垃圾、死节点与畸形命名过滤 ====================
const excludeNameRegex = /(到期|剩余|流量|官网|网址|联系|发布页|客服|重置|过期|测速|群|Telegram|TG|VIP|电报|更新|日期|免费VPN|free-nodes)/i;
const excludeErrorRegex = /(timeout|error|403|forbidden|blocked|1016|failed|refused|unreachable|0ms|nan|offline|down)/i;
const excludeReturnRegex = /(回国|大陆专用|解锁CN|学术|教育网)/i;

let filtered = list.filter(node => {
    if (!node || !node.name) return false;

    const name = String(node.name).trim();
    const server = String(node.server || '').trim();

    // 1. 过滤不包含任何有效汉字或英文国家/城市名的纯符号畸形节点（如 "🇸🇿_-_"）
    if (/^[\s\-_\|\(\)]*$/.test(name) || name.length <= 2) {
        return false;
    }

    // 2. IPv6 过滤
    if (server.includes('[') || (server.match(/:/g) || []).length >= 2 || /ipv6/i.test(name)) {
        return false;
    }

    // 3. 广告、错误、回国关键词过滤
    if (excludeNameRegex.test(name) || excludeErrorRegex.test(name) || excludeReturnRegex.test(name)) {
        return false;
    }

    // 4. 服务器地址异常拦截
    if (!server || server === '127.0.0.1' || server === 'localhost' || server.includes('0.0.0.0')) {
        return false;
    }

    // 5. 端口异常拦截
    if (node.port && (Number(node.port) <= 0 || Number(node.port) > 65535)) {
        return false;
    }

    return true;
});


// ==================== 第二部分：智能城市映射、重命名与保留关键字 ====================
const addflag = true;                   // 开启加国旗
const FGF = "_";                        // 分隔符
const XHFGF = " ";                      // 序号分隔符
const maxCount = 45;                    // 最大输出数量限制

const FG = ['🇭🇰','🇲🇴','🇹🇼','🇯🇵','🇰🇷','🇸🇬','🇺🇸','🇬🇧','🇫🇷','🇩🇪','🇦🇺','🇦🇪','🇦🇫','🇦🇱','🇩🇿','🇦🇴','🇦🇷','🇦🇲','🇦🇹','🇦🇿','🇧🇭','🇧🇩','🇧🇾','🇧🇪','🇧🇿','🇧🇯','🇧🇹','🇧🇴','🇧🇦','🇧🇼','🇧🇷','🇻🇬','🇧🇳','🇧🇬','🇧🇫','🇧🇮','🇰🇭','🇨🇲','🇨🇦','🇨🇻','🇰🇾','🇨🇫','🇹🇩','🇨🇱','🇨🇴','🇰🇲','🇨🇬','🇨🇩','🇨🇷','🇭🇷','🇨🇾','🇨🇿','🇩🇰','🇩🇯','🇩🇴','🇪🇨','🇪🇬','🇸🇻','🇬🇶','🇪🇷','🇪🇪','🇪🇹','🇫🇯','🇫🇮','🇬🇦','🇬🇲','🇬🇪','🇬🇭','🇬🇷','🇬🇱','🇬🇹','🇬🇳','🇬🇾','🇭🇹','🇭🇳','🇭🇺','🇮🇸','🇮🇳','🇮🇩','🇮🇷','🇮🇶','🇮🇪','🇮🇲','🇮🇱','🇮🇹','🇨🇮','🇯🇲','🇯🇴','🇰🇿','🇰🇪','🇰🇼','🇰🇬','🇱🇦','🇱🇻','🇱🇧','🇱🇸','🇱🇷','🇱🇾','🇱🇹','🇱🇺','🇲🇰','🇲🇬','🇲🇼','🇲🇾','🇲🇻','🇲🇱','🇲🇹','🇲🇷','🇲🇺','🇲🇽','🇲🇩','🇲🇨','🇲🇳','🇲🇪','🇲🇦','🇲🇿','🇲🇲','🇳🇦','🇳🇵','🇳🇱','🇳🇿','🇳🇮','🇳🇪','🇳🇬','🇰🇵','🇳🇴','🇴🇲','🇵🇰','🇵🇦','🇵🇾','🇵🇪','🇵🇭','🇵🇹','🇵🇷','🇶🇦','🇷🇴','🇷🇺','🇷🇼','🇸🇲','🇸🇦','🇸🇳','🇷🇸','🇸🇱','🇸🇰','🇸🇮','🇸🇴','🇿🇦','🇪🇸','🇱🇰','🇸🇩','🇸🇷','🇸🇿','🇸🇪','🇨🇭','🇸🇾','🇹🇯','🇹🇿','🇹🇭','🇹🇬','🇹🇴','🇹🇹','🇹🇳','🇹🇷','🇹🇲','🇻🇮','🇺🇬','🇺
