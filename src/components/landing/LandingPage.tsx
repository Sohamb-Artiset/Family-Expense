
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown, Cloud, CreditCard, PieChart, Receipt, Smile, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const LandingPage = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative pt-28 pb-20 md:pt-32 md:pb-28 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center py-1 px-3 rounded-full bg-blue/10 text-blue mb-6 animate-fade-in">
              <span className="text-sm font-medium">Easily monitor, track, and organize expenses</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
              <span className="text-gradient">Sync Expenses.</span> Save Time.<br />
              <span className="text-gradient">Split Costs.</span> Stay Organized.
            </h1>
            
            <p className="text-muted-foreground text-lg md:text-xl mb-8 animate-fade-in">
              Track personal and group expenses effortlessly. Create budgets, generate reports, and
              never wonder who owes what again.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10 animate-fade-in">
              <Button asChild size="lg" className="text-base font-medium">
                <Link to="/dashboard">Get Started <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
              
              <Button asChild variant="outline" size="lg" className="text-base font-medium">
                <Link to="#learn-more" className="flex items-center">
                  Learn More <ChevronDown className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
          
          {/* App Preview */}
          <div className="max-w-5xl mx-auto mt-10 relative animate-fade-in">
            <div className="glass-card rounded-xl overflow-hidden border border-border">
              <div className="rounded-lg overflow-hidden shadow-2xl">
                <div className="bg-black/30 backdrop-blur-sm p-4">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                </div>
                <div className="bg-card/90 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="glass-card p-4 rounded-lg flex flex-col items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-blue flex items-center justify-center">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="glass-card p-4 rounded-lg flex flex-col items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-blue flex items-center justify-center">
                        <Receipt className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="glass-card p-4 rounded-lg flex flex-col items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-blue flex items-center justify-center">
                        <PieChart className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <div className="bg-secondary/50 h-32 rounded-lg"></div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="bg-secondary/50 h-16 rounded-lg"></div>
                    <div className="bg-secondary/50 h-16 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-blue/20 rounded-full filter blur-3xl -z-10"></div>
            <div className="absolute -top-10 -left-10 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl -z-10"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="learn-more" className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything You Need to Manage Expenses</h2>
            <p className="text-muted-foreground">
              ExpenseSync combines powerful features with an intuitive interface to make expense tracking
              seamless.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="glass-card p-6 rounded-xl hover-scale">
              <div className="w-12 h-12 bg-category-food rounded-full flex items-center justify-center mb-4">
                <Receipt className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expense Management</h3>
              <p className="text-muted-foreground mb-4">
                Easily add, edit, and categorize personal expenses. Track receipts and notes for better organization.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-muted-foreground">
                  <div className="w-5 h-5 mr-2 text-green-500">✓</div>
                  Categorize expenses
                </li>
                <li className="flex items-center text-sm text-muted-foreground">
                  <div className="w-5 h-5 mr-2 text-green-500">✓</div>
                  Track recurring payments
                </li>
                <li className="flex items-center text-sm text-muted-foreground">
                  <div className="w-5 h-5 mr-2 text-green-500">✓</div>
                  Add notes & receipts
                </li>
              </ul>
            </div>
            
            {/* Feature 2 */}
            <div className="glass-card p-6 rounded-xl hover-scale">
              <div className="w-12 h-12 bg-blue rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Group Expenses</h3>
              <p className="text-muted-foreground mb-4">
                Create groups, invite members, and auto-split expenses. Track who paid what and who owes what.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-muted-foreground">
                  <div className="w-5 h-5 mr-2 text-green-500">✓</div>
                  Create unlimited groups
                </li>
                <li className="flex items-center text-sm text-muted-foreground">
                  <div className="w-5 h-5 mr-2 text-green-500">✓</div>
                  Smart expense splitting
                </li>
                <li className="flex items-center text-sm text-muted-foreground">
                  <div className="w-5 h-5 mr-2 text-green-500">✓</div>
                  Track group balances
                </li>
              </ul>
            </div>
            
            {/* Feature 3 */}
            <div className="glass-card p-6 rounded-xl hover-scale">
              <div className="w-12 h-12 bg-category-other rounded-full flex items-center justify-center mb-4">
                <PieChart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Reports & Analytics</h3>
              <p className="text-muted-foreground mb-4">
                Visualize spending patterns with intuitive charts and reports. Track monthly and yearly expenses.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-muted-foreground">
                  <div className="w-5 h-5 mr-2 text-green-500">✓</div>
                  Interactive charts
                </li>
                <li className="flex items-center text-sm text-muted-foreground">
                  <div className="w-5 h-5 mr-2 text-green-500">✓</div>
                  Monthly & yearly reports
                </li>
                <li className="flex items-center text-sm text-muted-foreground">
                  <div className="w-5 h-5 mr-2 text-green-500">✓</div>
                  Spending insights
                </li>
              </ul>
            </div>
            
            {/* Feature 4 */}
            <div className="glass-card p-6 rounded-xl hover-scale">
              <div className="w-12 h-12 bg-category-rent rounded-full flex items-center justify-center mb-4">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Budgeting & Alerts</h3>
              <p className="text-muted-foreground mb-4">
                Set monthly budgets for personal or group expenses. Receive alerts when approaching limits.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-muted-foreground">
                  <div className="w-5 h-5 mr-2 text-green-500">✓</div>
                  Custom budget creation
                </li>
                <li className="flex items-center text-sm text-muted-foreground">
                  <div className="w-5 h-5 mr-2 text-green-500">✓</div>
                  Smart notifications
                </li>
                <li className="flex items-center text-sm text-muted-foreground">
                  <div className="w-5 h-5 mr-2 text-green-500">✓</div>
                  Budget progress tracking
                </li>
              </ul>
            </div>
            
            {/* Feature 5 */}
            <div className="glass-card p-6 rounded-xl hover-scale">
              <div className="w-12 h-12 bg-category-shopping rounded-full flex items-center justify-center mb-4">
                <Cloud className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Export & Backup</h3>
              <p className="text-muted-foreground mb-4">
                Export your expense data in various formats. Cloud backup ensures your data is always safe.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-muted-foreground">
                  <div className="w-5 h-5 mr-2 text-green-500">✓</div>
                  CSV & PDF export
                </li>
                <li className="flex items-center text-sm text-muted-foreground">
                  <div className="w-5 h-5 mr-2 text-green-500">✓</div>
                  Automatic cloud backup
                </li>
                <li className="flex items-center text-sm text-muted-foreground">
                  <div className="w-5 h-5 mr-2 text-green-500">✓</div>
                  Data restoration
                </li>
              </ul>
            </div>
            
            {/* Feature 6 */}
            <div className="glass-card p-6 rounded-xl hover-scale">
              <div className="w-12 h-12 bg-category-travel rounded-full flex items-center justify-center mb-4">
                <Smile className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Ready to Get Started?</h3>
              <p className="text-muted-foreground mb-4">
                Join thousands of users who have simplified their expense management.
              </p>
              <Button asChild size="lg" className="w-full text-base font-medium">
                <Link to="/dashboard" className="flex items-center justify-center">
                  Try ExpenseSync Now <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-card py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start mb-12">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-blue rounded-full w-8 h-8 flex items-center justify-center text-white text-sm font-bold">
                  ES
                </div>
                <span className="font-bold text-xl">ExpenseSync</span>
              </div>
              <p className="text-muted-foreground max-w-xs mb-4">
                Simplify expense tracking for individuals and groups. Track, split, and analyze expenses
                effortlessly.
              </p>
              <p className="text-sm text-muted-foreground">
                © 2023 ExpenseSync. All rights reserved.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-sm font-semibold mb-4">Product</h4>
                <ul className="space-y-3">
                  <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Features</a></li>
                  <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Pricing</a></li>
                  <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Testimonials</a></li>
                  <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">FAQ</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold mb-4">Company</h4>
                <ul className="space-y-3">
                  <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">About</a></li>
                  <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Blog</a></li>
                  <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Careers</a></li>
                  <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Contact</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold mb-4">Legal</h4>
                <ul className="space-y-3">
                  <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy</a></li>
                  <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms</a></li>
                  <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Security</a></li>
                  <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Cookies</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-6 mb-4 md:mb-0">
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">Twitter</span>
                Twitter
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">LinkedIn</span>
                LinkedIn
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">GitHub</span>
                GitHub
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">Instagram</span>
                Instagram
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
