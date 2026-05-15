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
    const visibleItems = this.getVisibleItems(user, items);
    const total = this.calculateTotal(visibleItems);
    const body = visibleItems
      .map((item) => this.formatItem(reportType, user, item))
      .join('');

    return (
      this.formatHeader(reportType, user)
      + body
      + this.formatFooter(reportType, total)
    ).trim();
  }

  getVisibleItems(user, items) {
    return items
      .filter((item) => this.canUserSeeItem(user, item))
      .map((item) => this.applyAdminPriority(user, item));
  }

  canUserSeeItem(user, item) {
    return user.role === 'ADMIN' || (user.role === 'USER' && item.value <= 500);
  }

  applyAdminPriority(user, item) {
    if (user.role === 'ADMIN' && item.value > 1000) {
      item.priority = true;
    }

    return item;
  }

  calculateTotal(items) {
    return items.reduce((total, item) => total + item.value, 0);
  }

  formatHeader(reportType, user) {
    if (reportType === 'CSV') {
      return 'ID,NOME,VALOR,USUARIO\n';
    }

    if (reportType === 'HTML') {
      return '<html><body>\n'
        + '<h1>Relatório</h1>\n'
        + `<h2>Usuário: ${user.name}</h2>\n`
        + '<table>\n'
        + '<tr><th>ID</th><th>Nome</th><th>Valor</th></tr>\n';
    }

    return '';
  }

  formatItem(reportType, user, item) {
    if (reportType === 'CSV') {
      return `${item.id},${item.name},${item.value},${user.name}\n`;
    }

    if (reportType === 'HTML') {
      return this.formatHtmlRow(item);
    }

    return '';
  }

  formatHtmlRow(item) {
    const attributes = item.priority ? ' style="font-weight:bold;"' : '';
    return `<tr${attributes}><td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>\n`;
  }

  formatFooter(reportType, total) {
    if (reportType === 'CSV') {
      return `\nTotal,,\n${total},,\n`;
    }

    if (reportType === 'HTML') {
      return '</table>\n'
        + `<h3>Total: ${total}</h3>\n`
        + '</body></html>\n';
    }

    return '';
  }
}
