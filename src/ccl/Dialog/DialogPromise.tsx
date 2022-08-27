import { ActionConfig } from './DialogContainer';
import { DialogService } from './DialogService';

type Resolve<Success> = <T extends any = any>(value: Success) => void | T | Promise<T> | any;
type Reject<Error> = <T extends any = any>(value: Error) => void | T | Promise<T> | any;
type PromiseExecutor<Success, Error> = (resolve: Resolve<Success>, reject: Reject<Error>) => void;

type Then = 'then';
type Catch = 'catch';

class DialogPromiseClass<Success extends any = any, Err extends any = any> {
  private callbackIndex = -1;

  private resolversAndRejectors: ({ type: Then, callback: Resolve<Success> } | {type: Catch, callback: Reject<Err>})[] = [];
  private onDone?: () => void;

  constructor(executor: PromiseExecutor<Success, Err>) {
    executor(this.resolve, this.reject);
  }

  static all = Promise.all;
  static race = Promise.race;
  static reject = Promise.reject;
  static resolve = Promise.resolve;
  static allSettled = Promise.allSettled;
  static readonly [Symbol.species] = Promise;
  private previousActionType?: string;
  readonly [Symbol.toStringTag]: string;

  private finalThen = () => {
    if (!DialogService.isClosing) {
      DialogService.unmountDialog();
    }
  };

  private getNext = <T extends (Then | Catch)>(type: T) => {
    const callbackIndex = this.resolversAndRejectors.findIndex((handler, index) => {
      if (index > this.callbackIndex && handler.type === type) {
        return true;
      }
      return false;
    });
    if (callbackIndex !== -1) {
      this.callbackIndex = callbackIndex;
      const func = this.resolversAndRejectors[callbackIndex];
      return func.callback as (T extends Then ? Resolve<Success> : Reject<Err>);
    } else {
      this.resolversAndRejectors.pop();
      this.callbackIndex = -1; // Reset to start then chaining again on resolve again
      this.onDone && this.onDone();
    }
    return;
  };

  private resolve: any = (value?: {action: ActionConfig, state: any}) => {
    const action = value?.action;
    this.previousActionType = action?.type || this.previousActionType;
    const finalResolverThen = this.resolversAndRejectors[this.resolversAndRejectors.length - 1];
    if (!(finalResolverThen && finalResolverThen.callback === this.finalThen) && this.previousActionType !== 'menu') {
      this.resolversAndRejectors.push({ type: 'then', callback: this.finalThen });
    }
    const then = this.getNext('then');
    if (then) {
      try {
        const thenReturnedValue = then<Success>(value as any);
        if (thenReturnedValue instanceof Promise) {
          return thenReturnedValue.then<any>(this.resolve).catch(() => {
            this.callbackIndex = -1;
          });
        } else {
          return this.resolve(thenReturnedValue as Success);
        }
      } catch (e: any) {
        return this.reject(e);
      }
    }
  };

  private reject: Reject<Err> = (value) => {
    const _catch = this.getNext('catch');
    if (_catch) {
      try {
        const catchReturnedValue = _catch(value);
        if (catchReturnedValue instanceof Promise) {
          return catchReturnedValue.then<any>(this.resolve).catch((e) => {
            this.reject(e);
          });
        } else {
          return this.resolve(catchReturnedValue as Success);
        }
      } catch (e: any) {
        return this.reject(e);
      }
    }
  };

  then = (callback: Resolve<Success>) => {
    this.resolversAndRejectors.push({type: 'then', callback});
    return this;
  };

  catch = (callback: Reject<Err>) => {
    this.resolversAndRejectors.push({type: 'catch', callback});
    return this;
  };

  finally = (callback: () => void) => {
    this.onDone = callback;
    return this;
  };
}

export const DialogPromise = DialogPromiseClass as unknown as PromiseConstructor;
