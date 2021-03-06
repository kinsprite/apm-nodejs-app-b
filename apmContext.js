const { getAPM } = require("./apm");

class ApmContext {
  constructor() {
    const ins = getAPM()._instrumentation;

    this.ins = ins;
    this.trans = ins.currentTransaction;
    this.span = ins.currentSpan;

    this.prevTrans = null;
    this.prevActiveSpan = null;
  }

  active(sync = false) {
    const ins = this.ins;
    this.prevTrans = ins.currentTransaction;
    this.prevActiveSpan = ins.activeSpan

    ins.currentTransaction = this.trans;
    ins.bindingSpan = null;
    ins.activeSpan = this.span;

    if (this.trans) {
      this.trans.sync = sync;
    }

    if (this.span) {
      this.span.sync = sync;
    }
  }

  inactive() {
    const ins = this.ins;

    ins.currentTransaction = this.prevTrans;
    ins.bindingSpan = null;
    ins.activeSpan = this.prevActiveSpan;
  }
}

module.exports = {
  ApmContext,
};
