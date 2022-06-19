import { ArrayResource, BaseTexture, ImageResource } from '@pixi/core';
import { join } from 'path';

describe('ArrayResource', () =>
{
    let basePath: string;
    let imageUrl: string;

    beforeAll(() =>
    {
        basePath = join(__dirname, 'resources');
        imageUrl = join(basePath, 'slug.png');
    });

    it('should create new resource by length', () =>
    {
        const resource = new ArrayResource(5, { width: 100, height: 100 });

        resource.destroy();
        expect(resource.destroyed).toBe(true);
    });

    it('should error on out of bound', () =>
    {
        const resource = new ArrayResource(5, { width: 100, height: 100 });
        const image = new ImageResource(imageUrl);

        expect(() => resource.addResourceAt(image, 10)).to.throw(Error, /out of bounds/);

        resource.destroy();
    });

    it('should load array of URL resources', () =>
    {
        const images = [
            imageUrl,
            imageUrl,
            imageUrl,
            imageUrl,
        ];

        const resource = new ArrayResource(images, {
            width: 100,
            height: 100,
        });
        const baseTexture = {
            setRealSize: sinon.stub(),
            update: sinon.stub(),
        } as unknown as BaseTexture;

        resource.bind(baseTexture);

        return resource.load().then((res) =>
        {
            expect(res).toEqual(resource);
            // @ts-expect-error - issue with sinon typings
            expect(baseTexture.setRealSize.calledOnce).toBe(true);
            for (let i = 0; i < images.length; i++)
            {
                const item = resource.items[i].resource;

                expect(item.valid).toBe(true);
                expect(item.width).toEqual(100);
                expect(item.height).toEqual(100);
            }
            resource.unbind(baseTexture);
            resource.destroy();
        });
    });
});
