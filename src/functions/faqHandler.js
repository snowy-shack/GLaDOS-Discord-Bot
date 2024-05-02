const faqsJSON = require("../faqs.json");

async function getFaqReply(id) {
  console.log(id);
  object = faqsJSON.find(object => object.id == id)

  if (object) {
    return '# ' + object.question + '\n' + object.answer;
  } 
  return '> ❌ `Unknown faq ID!`';
}

module.exports = { getFaqReply };