import React from 'react';
import { TrendingUp, Landmark, Gem, Bot } from 'lucide-react';
import { AdviceCard } from './AdviceCard';
import { useTranslation } from '../../context/TranslationContext';
import { Card, CardHeader, CardTitle } from '../ui/card';

const InvestmentAdvice = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-none">
        <CardHeader className="flex flex-row items-center justify-center space-x-2">
          <Bot className="w-6 h-6 text-blue-600" />
          <CardTitle className="text-xl font-bold text-blue-900">
            {t.investmentCategories.aiAdvisory}
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
        <AdviceCard
          icon={<TrendingUp />}
          title={t.investmentCategories.stockMarket}
          type="market"
        />
        <AdviceCard
          icon={<Landmark />}
          title={t.investmentCategories.bankingInvestment}
          type="banking"
        />
        <AdviceCard
          icon={<Gem />}
          title={t.investmentCategories.alternativeInvestments}
          type="alternative"
        />
      </div>
    </div>
  );
};

export default React.memo(InvestmentAdvice);
