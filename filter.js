/**
 * Sub-Store 节点高级清洗与过滤脚本（全兼容防错版）
 */
function filterNodes(nodes) {
    // 兼容处理：判断传入的是纯数组，还是包含 proxies 属性的 Clash 对象
    let isClashObject = false;
    let list = nodes;

    if (!Array.isArray(nodes)) {
        if (nodes && Array.isArray(nodes.proxies)) {
            isClashObject = true;
            list = nodes.proxies;
        } else {
            return nodes; // 如果结构不匹配则原样返回，防止报错
        }
    }

    // 1. 垃圾/广告/提示文案关键词正则
    const excludeNameRegex = /(到期|剩余|流量|官网|网址|联系|发布页|客服|重置|过期|测速|群|Telegram|TG|VIP)/i;

    // 2. 被墙/失败/报错特征关键词正则
    const excludeErrorRegex = /(timeout|error|403|forbidden|blocked|1016|failed|refused|unreachable|0ms|nan)/i;

    // 3. 回国及特定不需要的节点关键词正则
    const excludeReturnRegex = /(回国|大陆专用|解锁CN|学术|教育网)/i;

    const filteredList = list.filter(node => {
        if (!node || !node.name) {
            return false;
        }

        const name = String(node.name).trim();
        const server = String(node.server || '').trim();

        // IPv6 过滤（检查服务器地址是否包含中括号、多个冒号，或名称含 ipv6）
        if (server.includes('[') || (server.match(/:/g) || []).length >= 2 || /ipv6/i.test(name)) {
            return false;
        }

        // 广告、报错、回国关键词过滤
        if (excludeNameRegex.test(name) || excludeErrorRegex.test(name) || excludeReturnRegex.test(name)) {
            return false;
        }

        // 延迟过滤 (>400ms 或 <=0 的剔除)
        if (typeof node.delay !== 'undefined' && node.delay !== null) {
            const delay = Number(node.delay);
            if (!isNaN(delay) && (delay <= 0 || delay > 400)) {
                return false;
            }
        }

        return true;
    });

    // 如果原本是 Clash 对象，需要把过滤后的数组放回 proxies 属性中
    if (isClashObject) {
        nodes.proxies = filteredList;
        return nodes;
    }

    return filteredList;
}

// Sub-Store 脚本入口
if (typeof $nodes !== 'undefined') {
    $nodes = filterNodes($nodes);
}
