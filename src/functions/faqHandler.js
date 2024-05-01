faqs = {
  portalable_blocks: `
  # What blocks are portalable in the mod?\nBy default, at least at the moment, the list of blocks you can place portals on includes Endstone, Portalable Panels added by us, and types of Concrete. However, this list is fully configurable by using datapacks to modify the block tag in your world, so if you want any blocks to be portalable as well, that's possible.\n\`id: portalable_blocks\`
  `
}

async function getFaqReply(id) {
  if (faqs[id]) {
    return faqs[id];
  } else {
    return '❌ Unknown faq ID!';
  }
}

module.exports = { getFaqReply };