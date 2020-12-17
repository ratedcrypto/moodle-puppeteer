const escapeXpathString = (str) => {
  const splitedQuotes = str.replace(/'/g, `', "'", '`);
  return `concat('${splitedQuotes}', '')`;
};

const clickByText = async function (page, text, element) {
  element = element || 'a';
  const escapedText = escapeXpathString(text);
  xpath = `//${element}[text()[contains(., ${escapedText})]]`;
  const elements = await page.$x(xpath);
  if (elements.length > 0) {
    for (i in elements) {
      e = elements[i];
      if (await e.isIntersectingViewport()) {
        await e.click();
        return;
      }
    }
  } else {
    console.log(xpath);
  }
  throw new Error(`Link not found: ${text}`);
};

module.exports = { clickByText };
