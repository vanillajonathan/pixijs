import { BasePrepare } from '@pixi/prepare';

import { AbstractRenderer } from '@pixi/core';
import { DisplayObject } from '@pixi/display';

describe('BasePrepare', () =>
{
    it('should create a new, empty, BasePrepare', () =>
    {
        const renderer = {} as AbstractRenderer;
        const prep = new BasePrepare(renderer);

        expect(prep['renderer']).toEqual(renderer);
        expect(prep['uploadHookHelper']).toBeNull();
        expect(prep['queue']).to.be.empty;
        expect(prep.addHooks).to.have.lengthOf(5);
        expect(prep.uploadHooks).to.have.lengthOf(2);
        expect(prep.completes).to.be.empty;

        prep.destroy();
    });

    it('should add hooks', () =>
    {
        function addHook() { return true; }
        function uploadHook() { return true; }
        const renderer = {} as AbstractRenderer;
        const prep = new BasePrepare(renderer);

        prep.registerFindHook(addHook);
        prep.registerUploadHook(uploadHook);

        expect(prep.addHooks).to.contain(addHook);
        expect(prep.addHooks).to.have.lengthOf(6);
        expect(prep.uploadHooks).to.contain(uploadHook);
        expect(prep.uploadHooks).to.have.lengthOf(3);

        prep.destroy();
    });

    it('should call hooks and complete', () =>
    {
        const renderer = {} as AbstractRenderer;
        const prep = new BasePrepare(renderer);
        const uploadItem = {} as DisplayObject;
        const uploadHelper = {};

        prep['uploadHookHelper'] = uploadHelper;

        const addHook = sinon.spy((item, queue) =>
        {
            expect(item).toEqual(uploadItem);
            expect(queue).toEqual(prep['queue']);
            queue.push(item);

            return true;
        });
        const uploadHook = sinon.spy((helper, item) =>
        {
            expect(helper).toEqual(uploadHelper);
            expect(item).toEqual(uploadItem);

            return true;
        });

        prep.registerFindHook(addHook);
        prep.registerUploadHook(uploadHook);
        prep.upload(uploadItem);

        expect(prep['queue']).to.contain(uploadItem);

        prep.prepareItems();

        expect(addHook.calledOnce).toBe(true);
        expect(uploadHook.calledOnce).toBe(true);

        prep.destroy();
    });

    it('should call complete if no queue', async () =>
    {
        const renderer = {} as AbstractRenderer;
        const prep = new BasePrepare(renderer);

        function addHook()
        {
            return false;
        }
        const complete = sinon.spy(() => { /* empty */ });

        prep.registerFindHook(addHook);
        await prep.upload({} as DisplayObject).then(complete);

        expect(complete.calledOnce).toBe(true);

        prep.destroy();
    });

    it('should remove un-preparable items from queue', () =>
    {
        const renderer = {} as AbstractRenderer;
        const prep = new BasePrepare(renderer);

        const addHook = sinon.spy((item, queue) =>
        {
            queue.push(item);

            return true;
        });
        const uploadHook = sinon.spy(() =>
            false);

        prep.registerFindHook(addHook);
        prep.registerUploadHook(uploadHook);
        prep.upload({} as DisplayObject);

        expect(prep['queue']).to.have.lengthOf(1);

        prep.prepareItems();

        expect(prep['queue']).to.be.empty;
        expect(addHook.calledOnce).toBe(true);
        expect(uploadHook.calledOnce).toBe(true);

        prep.destroy();
    });

    it('should remove destroyed items from queue', () =>
    {
        const renderer = {} as AbstractRenderer;
        const prep = new BasePrepare(renderer);

        const addHook = sinon.spy((item, queue) =>
        {
            queue.push(item);

            return true;
        });
        const uploadHook = sinon.spy(() =>
            false);

        prep.registerFindHook(addHook);
        prep.registerUploadHook(uploadHook);
        const item = {} as DisplayObject;

        prep.upload(item);

        expect(prep['queue']).to.have.lengthOf(1);

        item['_destroyed'] = true;
        prep.prepareItems();

        expect(prep['queue']).to.be.empty;
        expect(addHook.calledOnce).toBe(true);
        expect(uploadHook.called).toBe(false);

        prep.destroy();
    });

    it('should attach to the system ticker', async () =>
    {
        const renderer = {} as AbstractRenderer;
        const prep = new BasePrepare(renderer);

        const addHook = sinon.spy((item, queue) =>
        {
            queue.push(item);

            return true;
        });
        const uploadHook = sinon.spy(() => true);

        prep.registerFindHook(addHook);
        prep.registerUploadHook(uploadHook);
        await prep.upload({} as DisplayObject);

        expect(prep['queue']).to.be.empty;
        expect(addHook.calledOnce).toBe(true);
        expect(uploadHook.calledOnce).toBe(true);

        prep.destroy();
    });
});
