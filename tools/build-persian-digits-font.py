#!/usr/bin/env python3
"""Builds umiji-persian-digits.woff2, the font that gives the Persian UI its digits.

It is Montserrat's Basic Latin plus Vazirmatn's Persian digits, both variable (wght 100-900):
  - 0-9 draw as the Persian digits by default, so "۱۸۷ GiB" and "۳۰ روز" need no markup.
  - A digit touching a Latin letter stays Latin (the `calt` rules below), so OAuth2, IPv4, v2rayNG
    and mehdi77 read correctly, including text brokers type themselves.
The text itself stays 0-9, so nothing that parses, saves or copies a number can notice.

usage: python3 -I build-persian-digits-font.py <montserrat-latin.woff2> <vazirmatn-arabic.woff2> <out.woff2>
Sources are the variable latin / arabic woff2 files Google Fonts serves. Needs fonttools and brotli.
"""
import sys

from fontTools import subset
from fontTools.feaLib.builder import addOpenTypeFeaturesFromString
from fontTools.ttLib import TTFont
from fontTools.ttLib.tables._g_l_y_f import Glyph, GlyphCoordinates
from fontTools.ttLib.tables.ttProgram import Program
from fontTools.ttLib.tables.TupleVariation import TupleVariation
from fontTools.varLib import instancer
from fontTools.varLib.models import piecewiseLinearMap

# Vazirmatn's digits are a little short beside Montserrat's capitals.
DIGIT_SIZE = 1.08
BASIC_LATIN = range(0x20, 0x7F)
LATIN_DIGITS = [0x30 + i for i in range(10)]
PERSIAN_DIGITS = [0x6F0 + i for i in range(10)]
FAMILY = 'Umiji Persian Digits'

base_path, donor_path, out_path = sys.argv[1:4]
base, donor = TTFont(base_path), TTFont(donor_path)

for font, label in ((base, 'montserrat'), (donor, 'vazirmatn')):
    axis = font['fvar'].axes[0]
    if (axis.axisTag, axis.minValue, axis.maxValue) != ('wght', 100, 900):
        sys.exit(f'{label}: expected a wght 100-900 variable font, got {axis.axisTag} {axis.minValue}-{axis.maxValue}')
    print(label, 'default wght', axis.defaultValue, 'upem', font['head'].unitsPerEm)

base_axis = base['fvar'].axes[0]
if base_axis.defaultValue != 100:
    sys.exit('expected Montserrat to default to wght 100; the digit masters below assume it')
base_avar = base['avar'].segments.get('wght') if 'avar' in base else None


def on_base_axis(wght):
    """Where a weight sits on Montserrat's normalized axis."""
    value = (wght - base_axis.defaultValue) / (base_axis.maxValue - base_axis.defaultValue)
    return piecewiseLinearMap(value, base_avar) if base_avar else value


# Vazirmatn defaults to wght 400 and Montserrat to 100, so its deltas can't be copied across.
# Read its real outlines at three weights instead and re-express them on Montserrat's axis.
donor_at = {w: instancer.instantiateVariableFont(TTFont(donor_path), {'wght': w}) for w in (100, 400, 900)}

# Keep only Basic Latin, with its kerning; the app's own Montserrat still covers everything else.
opts = subset.Options()
opts.layout_features = ['kern']
opts.name_IDs = ['*']
opts.notdef_outline = True
opts.hinting = False
subsetter = subset.Subsetter(opts)
subsetter.populate(unicodes=BASIC_LATIN)
subsetter.subset(base)

scale = base['head'].unitsPerEm / donor['head'].unitsPerEm * DIGIT_SIZE
donor_cmap, base_cmap = donor.getBestCmap(), base.getBestCmap()
glyf, hmtx, gvar = base['glyf'], base['hmtx'], base['gvar']
persian_names, latin_names = [], [base_cmap[c] for c in LATIN_DIGITS]



def outline_at(wght, source_name):
    """A digit's scaled points at one weight, with gvar's four phantom points (the advance is the second)."""
    font = donor_at[wght]
    # getCoordinates also expands composites: some digits are references to the Arabic-Indic glyphs.
    coordinates, end_points, flags = font['glyf'][source_name].getCoordinates(font['glyf'])
    points = [(round(x * scale), round(y * scale)) for x, y in coordinates]
    advance = round(font['hmtx'][source_name][0] * scale)
    return end_points, flags, points + [(0, 0), (advance, 0), (0, 0), (0, 0)]


def difference(a, b):
    return [(x1 - x0, y1 - y0) for (x0, y0), (x1, y1) in zip(a, b)]


regular = on_base_axis(400)
for i, code in enumerate(PERSIAN_DIGITS):
    source_name = donor_cmap[code]
    end_points, flags, thin = outline_at(100, source_name)
    *_, normal = outline_at(400, source_name)
    *_, black = outline_at(900, source_name)

    # The font's default instance is the thinnest weight, so the glyph itself is the wght 100 outline.
    glyph = Glyph()
    glyph.numberOfContours = len(end_points)
    glyph.endPtsOfContours = list(end_points)
    glyph.flags = flags
    glyph.coordinates = GlyphCoordinates(thin[:-4])
    glyph.program = Program()
    glyph.program.fromBytecode(b'')

    name = f'persian{i}'
    glyf[name] = glyph
    glyph.recalcBounds(glyf)
    hmtx[name] = (thin[-3][0], glyph.xMin if glyph.numberOfContours else 0)
    # Two tents: thin to regular, then regular to black.
    gvar.variations[name] = [
        TupleVariation({'wght': (0, regular, 1)}, difference(thin, normal)),
        TupleVariation({'wght': (regular, 1, 1)}, difference(thin, black))
    ]
    persian_names.append(name)

base.setGlyphOrder(glyf.glyphOrder)
# HVAR indexes glyphs by position and doesn't know the new ones; advances come from gvar's phantom points without it.
for table in ('HVAR', 'STAT'):
    if table in base:
        del base[table]

for table in base['cmap'].tables:
    if table.isUnicode():
        for latin, persian, name in zip(LATIN_DIGITS, PERSIAN_DIGITS, persian_names):
            table.cmap[latin] = name
            table.cmap[persian] = name

letters = ' '.join(base_cmap[c] for c in list(range(0x41, 0x5B)) + list(range(0x61, 0x7B)))
joiners = ' '.join(base_cmap[c] for c in (0x2D, 0x5F))  # hyphen, underscore
inner = ' '.join(base_cmap[c] for c in (0x2D, 0x2E, 0x5F))  # also the dot: v1.2 but not 1.2 GiB
addOpenTypeFeaturesFromString(base, f"""
languagesystem DFLT dflt;
languagesystem latn dflt;
languagesystem arab dflt;

@letter = [{letters}];
@persian = [{' '.join(persian_names)}];
@latin = [{' '.join(latin_names)}];

# Reading forward: v2, x25519, US-NY-01, v1.2.
lookup afterLatin {{
    sub @letter @persian' by @latin;
    sub @letter [{joiners}] @persian' by @latin;
    sub @latin @persian' by @latin;
    sub @latin [{inner}] @persian' by @latin;
}} afterLatin;

# Reading back from a letter: 10GB, 2FA, 0x7f.
lookup beforeLatin {{
    rsub @persian' @letter by @latin;
    rsub @persian' @latin by @latin;
}} beforeLatin;

feature calt {{
    lookup afterLatin;
    lookup beforeLatin;
}} calt;
""", tables=['GSUB'])  # Without this the builder drops GPOS, and with it all of Montserrat's kerning.

# The OFL asks a modified font not to pose as the original; both copyright notices stay.
copyright_notice = ' / '.join(
    r.toUnicode() for f in (base, donor) for r in f['name'].names if r.nameID == 0 and r.platformID == 3
)
for record in base['name'].names:
    if record.nameID == 0:
        record.string = copyright_notice
    elif record.nameID in (1, 4, 16):
        record.string = FAMILY
    elif record.nameID == 6:
        record.string = FAMILY.replace(' ', '')
    elif record.nameID == 3:
        record.string = FAMILY + ' (Montserrat and Vazirmatn)'

base.flavor = 'woff2'
base.save(out_path)
print('saved', out_path)
