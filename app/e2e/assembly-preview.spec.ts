import { expect, test } from '@playwright/test';

const pcb=`(kicad_pcb (version 20241229) (general (thickness 1.2))
(gr_rect (start -8 -8) (end 8 8) (stroke (width 0.05)) (layer "Edge.Cuts"))
(gr_circle (center 5 5) (end 6 5) (stroke (width 0.05)) (layer "Edge.Cuts"))
(segment (start -4 0) (end 4 0) (width 0.5) (layer "F.Cu"))
(arc (start 4 0) (mid 5 1) (end 4 2) (width 0.3) (layer "B.Cu"))
(gr_text "PCB" (at 0 -5) (layer "F.SilkS") (effects (font (size 1 1))))
(footprint "component" (layer "F.Cu") (at 0 0) (property "Reference" "SW1")
(pad "1" thru_hole oval (at 0 0) (size 2 3) (drill oval 0.8 1.8) (layers "*.Cu" "*.Mask"))
(model "body.stl" (offset (xyz 0 0 0)) (scale (xyz 1 1 1)) (rotate (xyz 0 0 0)))))`;
const stl='solid part\nfacet normal 0 0 1\nouter loop\nvertex 0 0 0\nvertex 2 0 0\nvertex 0 3 0\nendloop\nendfacet\nendsolid part';

test('Design shows PCB and case bodies with view-only visibility controls',async({page})=>{
  await page.goto('/');await page.getByRole('button',{name:'3D assembly',exact:true}).click();
  await expect(page.getByLabel('Complete PCB assembly preview')).toBeVisible();
  await expect(page.getByText(/1.6 mm PCB/)).toBeVisible();
  await page.getByText('Visibility',{exact:true}).click();
  await expect(page.getByRole('checkbox',{name:'Switch plate',exact:true})).toBeVisible({timeout:45000});
  const revision=await page.locator('.wb-root').getAttribute('data-revision');
  await page.getByRole('checkbox',{name:'Switch plate',exact:true}).uncheck();
  await page.getByRole('checkbox',{name:'Copper',exact:true}).uncheck();
  await page.getByRole('button',{name:'Bottom',exact:true}).click();
  await expect(page.locator('.wb-root')).toHaveAttribute('data-revision',revision!);
  await page.getByRole('button',{name:'2D',exact:true}).click();await expect(page.getByRole('application',{name:/Board layout canvas/})).toBeVisible();
});

test('routed reference and STL mapping survive reopening and undo',async({page})=>{
  await page.goto('/');await page.getByRole('button',{name:'3D assembly',exact:true}).click();
  await page.getByText('Routed PCB reference',{exact:true}).click();
  await page.getByLabel('Import KiCad board',{exact:true}).setInputFiles({name:'routed.kicad_pcb',mimeType:'text/plain',buffer:Buffer.from(pcb)});
  await expect(page.getByText(/1.2 mm PCB/)).toBeVisible();
  await page.getByLabel('Attach model for body.stl',{exact:true}).setInputFiles({name:'body.stl',mimeType:'model/stl',buffer:Buffer.from(stl)});
  await expect(page.getByText('1 / 1 models · 1.2 mm PCB',{exact:true})).toBeVisible();
  await page.getByRole('spinbutton',{name:'Z (mm)',exact:true}).fill('7');await page.getByRole('spinbutton',{name:'Z (mm)',exact:true}).press('Tab');
  await page.reload();await page.getByRole('button',{name:'3D assembly',exact:true}).click();await page.getByText('Routed PCB reference',{exact:true}).click();
  await expect(page.getByRole('spinbutton',{name:'Z (mm)',exact:true})).toHaveValue('7');
  await expect(page.getByText('1 / 1 models · 1.2 mm PCB',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Remove PCB reference',exact:true}).click();
  await expect(page.getByText(/1.6 mm PCB/)).toBeVisible();await page.getByRole('button',{name:'Undo',exact:true}).click();
  await expect(page.getByText('1 / 1 models · 1.2 mm PCB',{exact:true})).toBeVisible();
});

test('custom assembly saves member placement and places it on the board',async({page})=>{
  await page.goto('/');await page.getByRole('tab',{name:'Parts',exact:true}).click();
  await page.getByRole('button',{name:'New assembly',exact:true}).click();
  const editor=page.locator('.wb-assembly-editor-layout');await editor.getByRole('textbox',{name:'Name',exact:true}).fill('Test assembly');
  await editor.getByRole('button',{name:'Add component',exact:true}).click();
  await editor.getByRole('combobox',{name:'Component',exact:true}).selectOption('mx-switch');
  await editor.getByRole('button',{name:'Save assembly',exact:true}).click();await expect(editor.getByText(/Assembly saved/)).toBeVisible();
  await editor.getByRole('button',{name:'Place on selected board',exact:true}).click();
  await expect(page.getByRole('tab',{name:'Design',exact:true})).toHaveAttribute('aria-selected','true');await expect(page.getByLabel('Complete PCB assembly preview')).toBeVisible();
});

test('applies a configured assembly to an existing matrix with undo', async ({page}) => {
  test.setTimeout(60_000);
  await page.goto('/');
  await page.getByRole('treeitem', {name:'Matrix 1 15 keys',exact:true}).click();
  const revision = Number(await page.locator('.wb-root').getAttribute('data-revision'));
  await page.getByRole('tab',{name:'Parts',exact:true}).click();
  await page.getByRole('option',{name:'Choc Hotswap',exact:true}).click();
  await page.getByRole('button',{name:'3D model',exact:true}).click();
  await page.getByRole('button',{name:'Apply to Matrix 1',exact:true}).click();
  await expect(page.locator('.wb-root')).toHaveAttribute('data-revision',String(revision + 1));
  await page.getByRole('tab',{name:'Design',exact:true}).click();
  await expect(page.locator('.wb-scene-part')).toHaveCount(30);
  await expect(page.getByRole('treeitem',{name:'Matrix 1 15 keys',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'3D assembly',exact:true}).click();
  await expect(page.getByText('60 / 60 models · 1.6 mm PCB',{exact:true})).toBeVisible({timeout:45_000});
  await page.getByRole('button',{name:'Undo',exact:true}).click();
  await page.getByRole('button',{name:'2D',exact:true}).click();
  await expect(page.locator('.wb-scene-part')).toHaveCount(15);
});
