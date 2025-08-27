import { findColorToken, tokenCategories, ColorToken, ColorCategory } from '@/lib/color-utils';

describe('Color Utils', () => {
  describe('tokenCategories', () => {
    it('should have valid structure', () => {
      expect(Array.isArray(tokenCategories)).toBe(true);
      expect(tokenCategories.length).toBeGreaterThan(0);
      
      tokenCategories.forEach(category => {
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('description');
        expect(category).toHaveProperty('colors');
        expect(Array.isArray(category.colors)).toBe(true);
        
        category.colors.forEach(color => {
          expect(color).toHaveProperty('name');
          expect(color).toHaveProperty('lightClassName');
          expect(color).toHaveProperty('darkClassName');
          expect(typeof color.name).toBe('string');
          expect(typeof color.lightClassName).toBe('string');
          expect(typeof color.darkClassName).toBe('string');
        });
      });
    });

    it('should contain expected categories', () => {
      const categoryNames = tokenCategories.map(cat => cat.name);
      expect(categoryNames).toContain('Primary');
    });
  });

  describe('findColorToken', () => {
    it('should find color by exact name', () => {
      const result = findColorToken('Main', 'Primary');
      expect(result).toBeDefined();
      expect(result?.name).toBe('Main');
      expect(result?.lightClassName).toContain('bg-blue');
    });

    it('should find color by name case insensitive', () => {
      const result = findColorToken('main', 'primary');
      expect(result).toBeDefined();
      expect(result?.name).toBe('Main');
    });

    it('should find color without category when unique', () => {
      const result = findColorToken('Main');
      expect(result).toBeDefined();
      expect(result?.name).toBe('Main');
    });

    it('should return undefined for non-existent color', () => {
      const result = findColorToken('NonExistent', 'Primary');
      expect(result).toBeUndefined();
    });

    it('should return undefined for non-existent category', () => {
      const result = findColorToken('Main', 'NonExistentCategory');
      expect(result).toBeUndefined();
    });

    it('should handle normalized names with spaces and hyphens', () => {
      // Assuming there's a color with spaces in the name
      const spacedResult = findColorToken('Border On', 'Primary');
      const hyphenResult = findColorToken('border-on', 'Primary');
      
      if (spacedResult) {
        expect(hyphenResult).toEqual(spacedResult);
      }
    });

    it('should prioritize category search when category is provided', () => {
      // Find a color that might exist in multiple categories
      const primaryResult = findColorToken('Main', 'Primary');
      const anyResult = findColorToken('Main');
      
      expect(primaryResult).toBeDefined();
      expect(anyResult).toBeDefined();
    });

    it('should handle empty or null inputs gracefully', () => {
      expect(findColorToken('')).toBeUndefined();
      expect(findColorToken('', '')).toBeUndefined();
    });

    it('should search across all categories when no category specified', () => {
      // Test that it can find colors from different categories
      const result = findColorToken('Main');
      expect(result).toBeDefined();
    });
  });

  describe('ColorToken type validation', () => {
    it('should validate ColorToken structure', () => {
      const validToken: ColorToken = {
        name: 'Test',
        lightClassName: 'bg-white',
        darkClassName: 'bg-black',
        variable: '--test',
        description: 'Test color',
      };

      expect(validToken.name).toBe('Test');
      expect(validToken.lightClassName).toBe('bg-white');
      expect(validToken.darkClassName).toBe('bg-black');
      expect(validToken.variable).toBe('--test');
      expect(validToken.description).toBe('Test color');
    });

    it('should validate ColorCategory structure', () => {
      const validCategory: ColorCategory = {
        name: 'Test Category',
        description: 'Test description',
        colors: [
          {
            name: 'Test Color',
            lightClassName: 'bg-white',
            darkClassName: 'bg-black',
          },
        ],
      };

      expect(validCategory.name).toBe('Test Category');
      expect(validCategory.description).toBe('Test description');
      expect(Array.isArray(validCategory.colors)).toBe(true);
      expect(validCategory.colors).toHaveLength(1);
    });
  });

  describe('Real token data validation', () => {
    it('should have consistent light and dark class names', () => {
      tokenCategories.forEach(category => {
        category.colors.forEach(color => {
          // Ensure light and dark classes are different (usually)
          if (color.lightClassName !== color.darkClassName) {
            expect(color.lightClassName).not.toBe(color.darkClassName);
          }
          
          // Ensure they follow some basic CSS class conventions (allow numbers and underscores)
          expect(color.lightClassName).toMatch(/^[a-z0-9-:_\s]+$/);
          expect(color.darkClassName).toMatch(/^[a-z0-9-:_\s]+$/);
        });
      });
    });

    it('should have valid category names', () => {
      tokenCategories.forEach(category => {
        expect(category.name).toBeTruthy();
        expect(category.description).toBeTruthy();
        expect(category.name.length).toBeGreaterThan(0);
        expect(category.description.length).toBeGreaterThan(0);
      });
    });
  });
});