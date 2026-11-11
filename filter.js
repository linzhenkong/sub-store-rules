// Sub-Store 终极清洗与过滤脚本（全功能增强版）
let list = [];

// 1. 兼容获取节点数据
if (typeof $nodes !== 'undefined' && Array.isArray($nodes)) {
    list = $nodes;
} else if (typeof proxies !== 'undefined' && Array.isArray(proxies)) {
    list = proxies;
} else if (typeof $in !== 'undefined' && Array.isArray($in)) {
    list = $in;
} else if (typeof $in !== 'undefined' && $in.proxies && Array.isArray($in.proxies)) {
    list = $in.proxies;
}

if (!Array.isArray(list) || list.length === 0) {
    return $nodes || proxies || [];
}

// 2. 定义过滤规则正则
// 【防误伤优化】：精准匹配广告/垃圾特征，避免误杀正常节点
const excludeNameRegex = /(到期|剩余|流量|官网|网址|联系|发布页|客服|重置|过期|测速|群|Telegram|TG|VIP|电报|更新|日期|免费VPN|free-nodes)/i;
// 报错特征
const excludeErrorRegex = /(timeout|error|403|forbidden|blocked|1016|failed|refused|unreachable|0ms|nan)/i;
// 【回国过滤】：剔除大陆专用、回国、解锁CN等节点
const excludeReturnRegex = /(回国|大陆专用|解锁CN|学术|教育网)/i;

const filtered = list.filter(node => {
    if (!node || !node.name) return true; // 防误伤：没有名字的保留

    const name = String(node.name).trim();
    const server = String(node.server || '').trim();

    // 【IPv6 过滤】：检测服务器地址是否包含 IPv6 特征或名字带 ipv6
    if (server.includes('[') || (server.match(/:/g) || []).length >= 2 || /ipv6/i.test(name)) {
        return false;
    }

    // 【垃圾/广告文案过滤 & 回国过滤】：检查节点名称是否命中黑名单
    if (excludeNameRegex.test(name) || excludeErrorRegex.test(name) || excludeReturnRegex.test(name)) {
        return false;
    }

    // 【延迟 >400ms 过滤】：如果节点自带延迟数据，直接剔除超高延迟或无效延迟
    if (typeof node.delay !== 'undefined' && node.delay !== null) {
        const delay = Number(node.delay);
        if (!isNaN(delay) && (delay <= 0 || delay > 400)) {
            return false;
        }
    }

    return true;
});

// 【防全空保护】：如果过滤完刚好全被删光了，返回原列表防止 500 报错，否则返回过滤后的列表
return filtered.length > 0 ? filtered : list;
