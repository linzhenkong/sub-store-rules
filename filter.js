/**
 * Sub-Store 节点清洗与精细过滤脚本
 * 
 * 功能说明：
 * 1. 过滤垃圾/提示性文案节点（到期时间、剩余流量、官网广告等）
 * 2. 过滤被墙/报错特征节点（403、Timeout、1016、Refused 等）
 * 3. 过滤高延迟节点（延迟 > 400ms 或 <= 0ms）
 * 4. 过滤 IPv6 节点（自动识别地址或节点名中的 IPv6 特征）
 */

function isIPv6(str) {
    if (!str) return false;
    // 匹配带有方括号的 IPv6 形式如 [2001:db8::1] 或标准的 8 段 IPv6 简写
    const ipv6Regex = /(\[?:?[a-fA-F0-9]{1,4}((?::[a-fA-F0-9]{1,4}){1,7}|:):?\]?)/;
    // 确保至少包含 2 个以上的冒号且符合十六进制特征，避免误伤普通 IPv4 或名称
    const colonCount = (str.match(/:/g) || []).length;
    return colonCount >= 2 && ipv6Regex.test(str);
}

function filterNodes(nodes) {
    // 1. 垃圾/广告/提示节点关键词正则
    const excludeNameRegex = /(到期|剩余|流量|官网|网址|联系|发布页|客服|重置|过期)/i;

    // 2. 被墙/失败特征关键词正则
    const excludeErrorRegex = /(timeout|error|403|forbidden|blocked|1016|failed|refused|unreachable|0ms|nan)/i;

    return nodes.filter(node => {
        // 校验 1：节点有效性
        if (!node || !node.name) {
            return false;
        }

        const name = node.name.trim();
        const server = (node.server || '').trim();

        // 校验 2：过滤 IPv6 节点（检查 server 地址或节点名称）
        if (isIPv6(server) || isIPv6(name) || /ipv6/i.test(name)) {
            return false;
        }

        // 校验 3：广告/提示节点过滤
        if (excludeNameRegex.test(name)) {
            return false;
        }

        // 校验 4：被墙/报错特征过滤
        if (excludeErrorRegex.test(name)) {
            return false;
        }

        // 校验 5：延迟过滤（剔除 <=0ms 或 >400ms 的节点）
        if (typeof node.delay !== 'undefined' && node.delay !== null) {
            const delay = Number(node.delay);
            if (isNaN(delay) || delay <= 0 || delay > 400) {
                return false;
            }
        }

        return true;
    });
}

// Sub-Store 脚本入口逻辑
if (typeof $nodes !== 'undefined') {
    $nodes = filterNodes($nodes);
}
