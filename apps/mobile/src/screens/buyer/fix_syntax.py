import re

with open("BuyerHomeScreen.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Fix the end of file `)}`
content = re.sub(r'\)\}\s*(</View>\s*</View>\s*</ScrollView>\s*</View>\s*\);\s*})', r'\1', content)

# Now, add `)}` at the right place:
grid_end = '''              </View>
            </View>
        </View>

        {/* ==================== BOUTIQUES DE CONFIANCE'''
        
grid_end_fixed = '''              </View>
            </View>
            )}
        </View>

        {/* ==================== BOUTIQUES DE CONFIANCE'''

content = content.replace(grid_end, grid_end_fixed)

with open("BuyerHomeScreen.tsx", "w", encoding="utf-8") as f:
    f.write(content)
