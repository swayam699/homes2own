import React from 'react';
import { UtensilsCrossed, ShieldCheck, Heart, GitBranch, Terminal } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                CRAVE<span className="text-brand-500">CART</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Artisanal, cloud-kitchen, and heritage restaurant delivery platform built with clean production architecture, relational MySQL schemas, and interactive micro-interactions.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700">
                React 18
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700">
                Tailwind CSS
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700">
                Node.js + Express
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700">
                MySQL 8.0
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700">
                Docker & Jenkins
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider">Cuisines</h5>
            <ul className="space-y-2 text-xs">
              <li className="hover:text-brand-400 cursor-pointer">Awadhi & Dum Biryani</li>
              <li className="hover:text-brand-400 cursor-pointer">Woodfired Neapolitan Pizza</li>
              <li className="hover:text-brand-400 cursor-pointer">Handcrafted Smash Burgers</li>
              <li className="hover:text-brand-400 cursor-pointer">North Indian Comfort Food</li>
              <li className="hover:text-brand-400 cursor-pointer">Organic & Keto Superbowls</li>
            </ul>
          </div>

          {/* Demonstration Accounts */}
          <div className="space-y-3">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider">Demo Credentials</h5>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="text-slate-200 font-semibold block">Customer:</span>
                customer@example.com
              </li>
              <li>
                <span className="text-slate-200 font-semibold block">Restaurant Admin:</span>
                restaurant@example.com
              </li>
              <li>
                <span className="text-slate-200 font-semibold block">System Admin:</span>
                admin@example.com
              </li>
              <li className="text-brand-400 font-mono text-[11px] pt-1">
                Password: Password123!
              </li>
            </ul>
          </div>

          {/* System & Architecture */}
          <div className="space-y-3">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider">Engineering</h5>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                JWT Auth & Role Guards
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <Terminal className="w-3.5 h-3.5 text-sky-400" />
                Normalized Relational DDL
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <GitBranch className="w-3.5 h-3.5 text-orange-400" />
                Jest + Supertest API Specs
              </li>
              <li className="text-[11px] text-slate-500 pt-1">
                Full-Stack College Capstone Project
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CraveCart Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400">Privacy Policy</span>
            <span className="hover:text-slate-400">Terms of Service</span>
            <span className="hover:text-slate-400">REST API Docs</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
