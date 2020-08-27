/**
 * permission:
 *  [ "storage","declarativeContent"]
 */
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ color: '#3aa757' }, () => {
    console.log('The color is green.');
  });

  /**
   * 使用chrome.declarativeContent API根据页面的内容采取行动，而不需要获得阅读页面内容的许可。
   */
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostEquals: 'www.baidu.com', schemes: ['https'] },
            css: ['input']
          })
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()]
      }
    ]);
  });
});
