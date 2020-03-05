(function ($) {
  'use strict';
  const linkType = '.PDF$|.DOC$|.DOCX$|.XLS$|.XLSX$|.RTF$';
  const contentType = 'PDF|DOC|DOCX|XLS|XLSX|RTF';
  $(document).ready(function () {
    $('a', '#qg-primary-content, #qg-secondary-content').each(function () {
      const $this = $(this);
      const linkRegex = new RegExp(linkType, 'i');
      // check to see if a link with a selected linkType exist
      // Example - cue-template-change-log.pdf|rtf...
      if (linkRegex.test($this.attr('href'))) {
        const contentRegex = new RegExp(contentType);
        const currContent = $this.text();
        if (/\.\d*?/.test(currContent)) {
          // check to see if decimals exist, if yes then round then off
          // Example (PDF 106.66) -> (PDF 106)
          const extractSize = new RegExp('\\((?:' + contentType.toUpperCase() + '),?\\s+[0-9\\.]+\\s*[KM]B\\)', 'i');
          if (currContent.match(extractSize)) {
            $(this).find('.meta').empty().append(currContent.match(extractSize)[0].toUpperCase().replace(/(\.\d*)/gi, ''));
          }
        } else if (!contentRegex.test(currContent)) {
          // check to see there is no doc type present in the content section
          // If yes then insert <span class="meta">PDF</span>
          const linkText = $this.attr('href').replace(/^.*\.(.+)$/, '$1').toUpperCase();
          $this.append(' <span class="meta">(' + linkText + ')</span>');
        }
      }
    });
  });
}(jQuery));
