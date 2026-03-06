import React, { useState } from 'react';
import { Modal } from 'react-native';
import CategorySelectionStep from './CategorySelectionStep';
import UrlInputStep from './UrlInputStep';
import LoadingStep from './LoadingStep';
import PreviewStep from './PreviewStep';
import { authApi, recipesApi, type CreateRecipeData } from '../../services/api';

export type ImportStep = 'category' | 'url' | 'loading' | 'preview';

export interface ScrapedRecipeData {
  title: string;
  description?: string;
  prepTime?: number;
  cookTime?: number;
  totalTime?: number;
  servings?: number;
  ingredients: string[];
  instructions: string[];
  imageUrl?: string;
  category?: string;
  cuisine?: string;
  author?: string;
  sourceUrl: string;
}

interface ImportRecipeFlowProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (recipe: any) => void;
}

export default function ImportRecipeFlow({
  visible,
  onClose,
  onSuccess,
}: ImportRecipeFlowProps) {
  const [currentStep, setCurrentStep] = useState<ImportStep>('category');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [url, setUrl] = useState('');
  const [scrapedData, setScrapedData] = useState<ScrapedRecipeData | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setCurrentStep('category');
    setSelectedCategory('');
    setUrl('');
    setScrapedData(null);
    setError(null);
    onClose();
  };

  const handleCategorySelected = (category: string) => {
    setSelectedCategory(category);
    setCurrentStep('url');
  };

  const handleUrlSubmit = async (urlInput: string) => {
    setUrl(urlInput);
    setCurrentStep('loading');
    setError(null);

    try {
      const response = await recipesApi.scrapeRecipe(urlInput);
      setScrapedData(response);
      setCurrentStep('preview');
    } catch (err: any) {
      const errorMessage =
        err.message || 'Failed to import recipe. Please try again.';
      setError(errorMessage);
      setCurrentStep('url');
    }
  };

  const handleReject = () => {
    setScrapedData(null);
    setCurrentStep('url');
  };

  const handleAccept = async (editedData: ScrapedRecipeData) => {
    try {
      const userId = await authApi.getCurrentUserId();
      const userName = await authApi.getCurrentUserName();

      if (!userId || !userName) {
        throw new Error('User information not found. Please log in again.');
      }

      const normalizedCategory =
        selectedCategory?.toLowerCase() || 'other';

      const instructionsArray = editedData.instructions || [];

      const steps = instructionsArray.map((text, index) => ({
        stepNumber: index + 1,
        description: text,
      }));

      const recipeData: CreateRecipeData = {
        title: editedData.title,
        description: editedData.description || '',
        category: normalizedCategory,
        difficulty: 'medium',
        prepTime: editedData.prepTime || 0,
        cookTime: editedData.cookTime || 0,
        servings: editedData.servings || 1,
        ingredients: editedData.ingredients || [],
        instructions: instructionsArray,
        steps,
        ownerId: userId,
        ownerName: userName,
        featuredImage: editedData.imageUrl,
        images: editedData.imageUrl ? [editedData.imageUrl] : [],
        featured: false,
      };

      const createdRecipe = await recipesApi.createRecipe(recipeData);
      onSuccess(createdRecipe);
      handleClose();
    } catch (err: any) {
      setError('Failed to create recipe. Please try again.');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      {currentStep === 'category' && (
        <CategorySelectionStep
          onSelect={handleCategorySelected}
          onClose={handleClose}
        />
      )}

      {currentStep === 'url' && (
        <UrlInputStep
          category={selectedCategory}
          onBack={() => setCurrentStep('category')}
          onSubmit={handleUrlSubmit}
          onClose={handleClose}
          error={error}
        />
      )}

      {currentStep === 'loading' && <LoadingStep url={url} />}

      {currentStep === 'preview' && scrapedData && (
        <PreviewStep
          data={scrapedData}
          category={selectedCategory}
          onReject={handleReject}
          onAccept={handleAccept}
          onClose={handleClose}
        />
      )}
    </Modal>
  );
}

