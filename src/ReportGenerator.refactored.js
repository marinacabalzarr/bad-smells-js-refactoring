const REPORT_FORMATTERS = {
  CSV: {
    header() {
      return 'ID,NOME,VALOR,USUARIO\n';
    },

    item(item, user) {
      return `${item.id},${item.name},${item.value},${user.name}\n`;
    },

    footer(total) {
      return `\nTotal,,\n${total},,\n`;
    },
  },

  HTML: {
    header(user) {
      return '<html><body>\n'
        + '<h1>Relatório</h1>\n'
        + `<h2>Usuário: ${user.name}</h2>\n`
        + '<table>\n'
        + '<tr><th>ID</th><th>Nome</th><th>Valor</th></tr>\n';
    },

    item(item) {
      const attributes = item.priority ? ' style="font-weight:bold;"' : '';
      return `<tr${attributes}><td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>\n`;
    },

    footer(total) {
      return '</table>\n'
        + `<h3>Total: ${total}</h3>\n`
        + '</body></html>\n';
    },
  },
};

export class ReportGenerator {
  constructor(database) {
    this.db = database;
  }

  /**
   * Gera um relatório de itens baseado no tipo e no usuário.
   * - Admins veem tudo.
   * - Users comuns só veem itens com valor <= 500.
   */
  generateReport(reportType, user, items) {
    const formatter = this.getFormatter(reportType);
    const visibleItems = this.getVisibleItems(user, items);
    const total = this.calculateTotal(visibleItems);

    return [
      formatter.header(user),
      this.formatItems(formatter, user, visibleItems),
      formatter.footer(total),
    ].join('').trim();
  }

  getFormatter(reportType) {
    return REPORT_FORMATTERS[reportType] || this.getEmptyFormatter();
  }

  getEmptyFormatter() {
    return {
      header: () => '',
      item: () => '',
      footer: () => '',
    };
  }

  getVisibleItems(user, items) {
    return items
      .filter((item) => this.canViewItem(user, item))
      .map((item) => this.applyPriority(user, item));
  }

  canViewItem(user, item) {
    return this.isAdmin(user) || this.isAllowedStandardUserItem(user, item);
  }

  isAdmin(user) {
    return user.role === 'ADMIN';
  }

  isAllowedStandardUserItem(user, item) {
    return user.role === 'USER' && item.value <= 500;
  }

  applyPriority(user, item) {
    if (this.isPriorityItem(user, item)) {
      item.priority = true;
    }

    return item;
  }

  isPriorityItem(user, item) {
    return this.isAdmin(user) && item.value > 1000;
  }

  calculateTotal(items) {
    return items.reduce((total, item) => total + item.value, 0);
  }

  formatItems(formatter, user, items) {
    return items
      .map((item) => formatter.item(item, user))
      .join('');
  }
}
